import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { openDB } from "./db.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Инициализация базы
const db = await openDB();
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tg_id TEXT UNIQUE,
    balance INTEGER DEFAULT 0
);
`);

// Получить или создать пользователя
async function getUser(tg_id) {
    let user = await db.get("SELECT * FROM users WHERE tg_id = ?", [tg_id]);
    if (!user) {
        await db.run("INSERT INTO users (tg_id, balance) VALUES (?, 0)", [tg_id]);
        user = await db.get("SELECT * FROM users WHERE tg_id = ?", [tg_id]);
    }
    return user;
}

// Получить баланс
app.post("/api/balance", async (req, res) => {
    const { tg_id } = req.body;
    const user = await getUser(tg_id);
    res.json({ balance: user.balance });
});

// Клик
app.post("/api/click", async (req, res) => {
    const { tg_id } = req.body;
    await db.run("UPDATE users SET balance = balance + 1 WHERE tg_id = ?", [tg_id]);
    const user = await getUser(tg_id);
    res.json({ balance: user.balance });
});

// Перевод
app.post("/api/transfer", async (req, res) => {
    const { from_id, to_id, amount } = req.body;

    const sender = await getUser(from_id);
    if (sender.balance < amount) return res.json({ error: "Недостаточно монет" });

    await getUser(to_id);

    await db.run("UPDATE users SET balance = balance - ? WHERE tg_id = ?", [amount, from_id]);
    await db.run("UPDATE users SET balance = balance + ? WHERE tg_id = ?", [amount, to_id]);

    res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));

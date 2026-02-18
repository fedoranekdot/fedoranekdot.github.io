const tg = window.Telegram.WebApp;
tg.expand();

let tg_id = tg.initDataUnsafe?.user?.id || 1; // если нет Telegram — тестовый ID

let balance = 0;

const balanceEl = document.getElementById("balance");
const clickBtn = document.getElementById("clickBtn");
const transferBtn = document.getElementById("transferBtn");
const infoBtn = document.getElementById("infoBtn");
const copyIdBtn = document.getElementById("copyIdBtn");


function updateBalance() {
    balanceEl.textContent = "Баланс: " + balance;
}

async function loadBalance() {
    const res = await fetch("https://fedoranekdot-github-io.onrender.com/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_id })
    });
    const data = await res.json();
    balance = data.balance;
    updateBalance();
}

clickBtn.addEventListener("click", async () => {
    const res = await fetch("https://fedoranekdot-github-io.onrender.com/api/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_id })
    });
    const data = await res.json();
    balance = data.balance;
    updateBalance();
});
copyIdBtn.addEventListener("click", () => {
    const tg_id = tg.initDataUnsafe?.user?.id || "unknown";

    navigator.clipboard.writeText(tg_id.toString())
        .then(() => {
            tg.showAlert("ID скопирован: " + tg_id);
        })
        .catch(() => {
            tg.showAlert("Не удалось скопировать ID");
        });
});

transferBtn.addEventListener("click", () => {
    const to_id = prompt("Введите ID пользователя");
    const amount = prompt("Введите сумму");

    fetch("https://fedoranekdot-github-io.onrender.com/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_id: tg_id, to_id, amount: Number(amount) })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) alert(data.error);
        else alert("Перевод выполнен");
        loadBalance();
    });
});

infoBtn.addEventListener("click", () => {
    alert("СУКА это приложение ебать для криптанов. мать ебал каждого");
});

loadBalance();




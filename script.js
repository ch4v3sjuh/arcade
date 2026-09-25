const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const playerNameInput = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboardList");

// Controles Mobile
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let score = 0;
let lives = 3;
let gameRunning = false;
let animationId;

// Jogador (Avião)
let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 7,
    dx: 0
};

// Itens caindo (Cristais e Bombas)
let items = [];
let spawnTimer = 0;

// Teclado
let keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.key === "ArrowLeft" && player.dx < 0) player.dx = 0;
    if (e.key === "ArrowRight" && player.dx > 0) player.dx = 0;
});

// Suporte a Toque (Celular)
function setupTouchControls(btn, direction) {
    const press = (e) => {
        e.preventDefault();
        player.dx = direction === 'left' ? -player.speed : player.speed;
    };
    const release = (e) => {
        e.preventDefault();
        player.dx = 0;
    };

    btn.addEventListener("touchstart", press);
    btn.addEventListener("touchend", release);
    btn.addEventListener("mousedown", press);
    btn.addEventListener("mouseup", release);
}

setupTouchControls(leftBtn, 'left');
setupTouchControls(rightBtn, 'right');

// Iniciar Jogo
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {
    score = 0;
    lives = 3;
    items = [];
    player.x = canvas.width / 2 - 25;
    scoreEl.textContent = score;
    updateLivesDisplay();

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    restartBtn.classList.add("hidden");
    document.getElementById("saveScoreContainer").style.display = "block";

    gameRunning = true;
    loop();
}

function updateLivesDisplay() {
    livesEl.textContent = "❤️".repeat(Math.max(0, lives));
}

// Criar itens aleatórios
function spawnItem() {
    const isBomb = Math.random() < 0.25; // 25% de chance de ser bomba
    items.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        size: 30,
        speed: 3 + Math.random() * 3,
        type: isBomb ? 'bomb' : 'crystal'
    });
}

// Loop Principal do Jogo
function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Movimentação do Jogador
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Desenhar Avião simples
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(player.x, player.y + 15, player.width, 15); // Corpo
    ctx.fillRect(player.x + 15, player.y, 20, 15); // Asas/Cabine

    // Spawnar itens
    spawnTimer++;
    if (spawnTimer > 40) {
        spawnItem();
        spawnTimer = 0;
    }

    // Atualizar e desenhar itens
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        // Desenhar item
        ctx.font = "24px sans-serif";
        ctx.fillText(item.type === 'crystal' ? "💎" : "💣", item.x, item.y);

        // Colisão com o avião
        if (
            item.x < player.x + player.width &&
            item.x + item.size > player.x &&
            item.y < player.y + player.height &&
            item.y + item.size > player.y
        ) {
            if (item.type === 'crystal') {
                score += 10;
                scoreEl.textContent = score;
            } else {
                lives--;
                updateLivesDisplay();
                if (lives <= 0) {
                    endGame();
                }
            }
            items.splice(i, 1);
            continue;
        }

        // Remover se passar da tela
        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }

    animationId = requestAnimationFrame(loop);
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove("hidden");
}

// Salvar Recorde
saveScoreBtn.addEventListener("click", () => {
    let name = playerNameInput.value.trim() || "Anônimo";
    let highScores = JSON.parse(localStorage.getItem("skyArcadeScores")) || [];
    
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5); // Salva top 5

    localStorage.setItem("skyArcadeScores", JSON.stringify(highScores));
    loadLeaderboard();

    document.getElementById("saveScoreContainer").style.display = "none";
    restartBtn.classList.remove("hidden");
});

function loadLeaderboard() {
    let highScores = JSON.parse(localStorage.getItem("skyArcadeScores")) || [];
    leaderboardList.innerHTML = "";
    
    if (highScores.length === 0) {
        leaderboardList.innerHTML = "<li><span>Nenhum recorde</span></li>";
        return;
    }

    highScores.forEach((entry, index) => {
        let li = document.createElement("li");
        li.innerHTML = `<span>${index + 1}. ${entry.name}</span> <strong>${entry.score}</strong>`;
        leaderboardList.appendChild(li);
    });
}

// Carregar placar ao iniciar a página
loadLeaderboard();
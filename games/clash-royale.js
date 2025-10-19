// clash-royales.js - Versión 1000% mejorada y funcional

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar canvas al tamaño real del contenedor
function resizeCanvas() {
    const container = document.querySelector('.arena-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Elementos del DOM
const playerCrownsElement = document.getElementById('playerCrowns');
const enemyCrownsElement = document.getElementById('enemyCrowns');
const timerElement = document.getElementById('timer');
const elixirFillElement = document.getElementById('elixirFill');
const elixirCountElement = document.getElementById('elixirCount');
const startScreen = document.getElementById('startScreen');
const modeSelectScreen = document.getElementById('modeSelectScreen');
const gameOverElement = document.getElementById('gameOver');
const victoryScreen = document.getElementById('victoryScreen');
const pausedScreen = document.getElementById('pausedScreen');
const playerNameElement = document.getElementById('playerName');
const enemyNameElement = document.getElementById('enemyName');
const playerNameInput = document.getElementById('playerNameInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartGameBtn = document.getElementById('restartGameBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');
const cardsContainer = document.getElementById('cardsContainer');

// Configuración
const ELIXIR_RATE = 0.02;
const MAX_ELIXIR = 10;
const GAME_DURATION = 180000; // 3 minutos
const DOUBLE_ELIXIR_TIME = 60000; // último minuto

// Estado del juego
let gameRunning = false;
let gamePaused = false;
let gameStartTime = 0;
let currentElixir = 5;
let playerCrowns = 0;
let enemyCrowns = 0;
let doubleElixirActive = false;

// Unidades y torres
let playerUnits = [];
let enemyUnits = [];
let playerTowers = [];
let enemyTowers = [];
let projectiles = [];
let damagePopups = [];

// Mazos
let playerHand = [];
const playerDeck = [
    { id: 'barbarian', cost: 5, health: 300, damage: 50, speed: 1.5, range: 40, icon: '🪓', color: '#e74c3c' },
    { id: 'archer', cost: 3, health: 150, damage: 30, speed: 1.2, range: 150, icon: '🏹', color: '#f39c12' },
    { id: 'giant', cost: 5, health: 800, damage: 40, speed: 0.8, range: 40, icon: '👹', color: '#e67e22' },
    { id: 'knight', cost: 3, health: 400, damage: 45, speed: 1.8, range: 40, icon: '⚔️', color: '#95a5a6' },
    { id: 'wizard', cost: 5, health: 200, damage: 60, speed: 1, range: 180, icon: '🔮', color: '#9b59b6' },
    { id: 'minion', cost: 3, health: 100, damage: 40, speed: 2, range: 40, icon: '👺', color: '#3498db' }
];

// Inicializar
function init() {
    document.getElementById('playBtn').addEventListener('click', () => {
        startScreen.style.display = 'none';
        modeSelectScreen.style.display = 'flex';
    });

    document.getElementById('botModeBtn').addEventListener('click', () => {
        modeSelectScreen.style.display = 'none';
        setupGame();
    });

    playerNameInput.addEventListener('input', () => {
        playerNameElement.textContent = playerNameInput.value || 'JUGADOR';
    });

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartGameBtn.addEventListener('click', resetGame);
    mainMenuBtn.addEventListener('click', () => location.reload());

    resetGame();
}

function setupGame() {
    // Crear torres
    playerTowers = [
        { x: 100, y: canvas.height / 2, width: 60, height: 80, health: 3000, maxHealth: 3000, type: 'king', side: 'player' },
        { x: 150, y: 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'player' },
        { x: 150, y: canvas.height - 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'player' }
    ];

    enemyTowers = [
        { x: canvas.width - 100, y: canvas.height / 2, width: 60, height: 80, health: 3000, maxHealth: 3000, type: 'king', side: 'enemy' },
        { x: canvas.width - 150, y: 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'enemy' },
        { x: canvas.width - 150, y: canvas.height - 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'enemy' }
    ];

    // Crear mano inicial
    playerHand = [...playerDeck.slice(0, 4)];
    renderCards();
    drawGame();
}

function renderCards() {
    cardsContainer.innerHTML = '';
    playerHand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.id.toUpperCase()}</div>
        `;
        cardEl.addEventListener('click', () => playCard(card));
        cardsContainer.appendChild(cardEl);
    });
}

function playCard(card) {
    if (currentElixir < card.cost || !gameRunning || gamePaused) return;

    currentElixir -= card.cost;
    const x = 100 + Math.random() * 50;
    const y = 100 + Math.random() * (canvas.height - 200);
    createUnit(card, x, y, 'player');
    updateUI();
}

function createUnit(card, x, y, side) {
    const unit = {
        x, y,
        width: 30,
        height: 30,
        health: card.health,
        maxHealth: card.health,
        damage: card.damage,
        speed: card.speed,
        range: card.range,
        icon: card.icon,
        color: card.color,
        side,
        target: null,
        attackCooldown: 0
    };

    if (side === 'player') playerUnits.push(unit);
    else enemyUnits.push(unit);
}

function startGame() {
    gameRunning = true;
    gamePaused = false;
    gameStartTime = Date.now();
    gameLoop();
}

function togglePause() {
    gamePaused = !gamePaused;
    pausedScreen.style.display = gamePaused ? 'flex' : 'none';
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    playerUnits = [];
    enemyUnits = [];
    projectiles = [];
    damagePopups = [];
    playerCrowns = 0;
    enemyCrowns = 0;
    currentElixir = 5;
    doubleElixirActive = false;
    updateUI();
    setupGame();
}

function updateUI() {
    playerCrownsElement.textContent = playerCrowns;
    enemyCrownsElement.textContent = enemyCrowns;
    elixirCountElement.textContent = Math.floor(currentElixir);
    elixirFillElement.style.width = `${(currentElixir / MAX_ELIXIR) * 100}%`;
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;

    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    const now = Date.now();
    const elapsed = now - gameStartTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remaining <= DOUBLE_ELIXIR_TIME && !doubleElixirActive) {
        doubleElixirActive = true;
        timerElement.style.color = '#9b59b6';
    }

    if (remaining <= 0) {
        endGame();
    }

    // Regenerar elixir
    currentElixir = Math.min(MAX_ELIXIR, currentElixir + (doubleElixirActive ? ELIXIR_RATE * 2 : ELIXIR_RATE));

    // Actualizar unidades
    updateUnits(playerUnits, enemyTowers);
    updateUnits(enemyUnits, playerTowers);

    updateUI();
}

function updateUnits(units, enemyTowers) {
    units.forEach(unit => {
        if (unit.health <= 0) return;

        const target = findNearestTarget(unit, enemyTowers);
        if (!target) return;

        const dist = getDistance(unit, target);
        if (dist < unit.range) {
            target.health -= unit.damage;
            createDamageEffect(target.x, target.y, unit.damage);
            if (target.health <= 0) onTowerDestroyed(target);
            units.splice(units.indexOf(unit), 1);
        } else {
            const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
            unit.x += Math.cos(angle) * unit.speed;
            unit.y += Math.sin(angle) * unit.speed;
        }
    });
}

function findNearestTarget(unit, towers) {
    return towers.find(t => t.health > 0);
}

function getDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function onTowerDestroyed(tower) {
    if (tower.side === 'player') enemyCrowns++;
    else playerCrowns++;

    if (tower.type === 'king') {
        gameRunning = false;
        if (tower.side === 'player') showGameOver();
        else showVictory();
    }
}

function createDamageEffect(x, y, damage) {
    damagePopups.push({ x, y, text: `-${damage}`, life: 60 });
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arena
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Río
    ctx.fillStyle = '#3498db';
    ctx.fillRect(canvas.width / 2 - 30, 50, 60, canvas.height - 100);

    // Torres
    [...playerTowers, ...enemyTowers].forEach(t => {
        if (t.health <= 0) return;
        ctx.fillStyle = t.type === 'king' ? '#e74c3c' : '#f39c12';
        ctx.fillRect(t.x - t.width / 2, t.y - t.height / 2, t.width, t.height);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(t.x - t.width / 2, t.y - t.height / 2 - 10, (t.health / t.maxHealth) * t.width, 5);
    });

    // Unidades
    [...playerUnits, ...enemyUnits].forEach(u => {
        ctx.fillStyle = u.color;
        ctx.beginPath();
        ctx.arc(u.x, u.y, u.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(u.icon, u.x, u.y + 5);
    });

    // Daño
    damagePopups.forEach((p, i) => {
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '12px Arial';
        ctx.fillText(p.text, p.x, p.y);
        p.y -= 1;
        p.life--;
        if (p.life <= 0) damagePopups.splice(i, 1);
    });
}

function showGameOver() {
    gameOverElement.style.display = 'flex';
    finalPlayerCrownsElement.textContent = playerCrowns;
    finalEnemyCrownsElement.textContent = enemyCrowns;
}

function showVictory() {
    victoryScreen.style.display = 'flex';
    victoryPlayerCrownsElement.textContent = playerCrowns;
    victoryEnemyCrownsElement.textContent = enemyCrowns;
}

function endGame() {
    gameRunning = false;
    if (playerCrowns > enemyCrowns) showVictory();
    else showGameOver();
}

// Iniciar
init();
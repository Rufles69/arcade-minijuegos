const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = document.querySelector('.arena-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// UI
const playerCrownsEl = document.getElementById('playerCrowns');
const enemyCrownsEl = document.getElementById('enemyCrowns');
const timerEl = document.getElementById('timer');
const elixirFillEl = document.getElementById('elixirFill');
const elixirCountEl = document.getElementById('elixirCount');

// Estado
let gameRunning = false;
let gameMode = '';
let playerName = 'JUGADOR';
let enemyName = 'BOT';
let currentElixir = 5;
const MAX_ELIXIR = 10;
const ELIXIR_RATE = 0.02;
const GAME_DURATION = 180000;
let gameStartTime = 0;
let playerCrowns = 0;
let enemyCrowns = 0;
let playerUnits = [];
let enemyUnits = [];
let playerTowers = [];
let enemyTowers = [];
let damagePopups = [];
let playerHand = [];
let enemyHand = [];
let activePlayer = 'player';

const deck = [
    { id: 'barbarian', cost: 5, health: 300, damage: 50, speed: 1.5, range: 40, icon: '🪓', color: '#e74c3c' },
    { id: 'archer', cost: 3, health: 150, damage: 30, speed: 1.2, range: 150, icon: '🏹', color: '#f39c12' },
    { id: 'giant', cost: 5, health: 800, damage: 40, speed: 0.8, range: 40, icon: '👹', color: '#e67e22' },
    { id: 'knight', cost: 3, health: 400, damage: 45, speed: 1.8, range: 40, icon: '⚔️', color: '#95a5a6' },
    { id: 'wizard', cost: 5, health: 200, damage: 60, speed: 1, range: 180, icon: '🔮', color: '#9b59b6' },
    { id: 'minion', cost: 3, health: 100, damage: 40, speed: 2, range: 40, icon: '👺', color: '#3498db' }
];

function showModeSelect() {
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('modeSelectScreen').classList.add('active');
}

function selectMode(mode) {
    gameMode = mode;
    playerName = document.getElementById('playerNameInput').value || 'JUGADOR';
    enemyName = mode === 'bot' ? 'BOT' : 'JUGADOR 2';

    document.getElementById('modeSelectScreen').classList.remove('active');
    document.getElementById('startBtn').style.display = 'inline-block';
    setupGame();
}

function setupGame() {
    playerHand = [...deck.slice(0, 4)];
    enemyHand = [...deck.slice(0, 4)];
    playerUnits = [];
    enemyUnits = [];
    damagePopups = [];
    playerCrowns = 0;
    enemyCrowns = 0;
    currentElixir = 5;
    activePlayer = 'player';

    playerTowers = [
        { x: 80, y: canvas.height / 2, width: 60, height: 80, health: 3000, maxHealth: 3000, type: 'king', side: 'player' },
        { x: 130, y: 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'player' },
        { x: 130, y: canvas.height - 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'player' }
    ];
    enemyTowers = [
        { x: canvas.width - 80, y: canvas.height / 2, width: 60, height: 80, health: 3000, maxHealth: 3000, type: 'king', side: 'enemy' },
        { x: canvas.width - 130, y: 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'enemy' },
        { x: canvas.width - 130, y: canvas.height - 120, width: 40, height: 60, health: 1500, maxHealth: 1500, type: 'princess', side: 'enemy' }
    ];

    renderCards();
    drawGame();
    updateUI();
}

function renderCards() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    const hand = activePlayer === 'player' ? playerHand : enemyHand;
    hand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        if ((activePlayer === 'player' && currentElixir < card.cost) || !gameRunning) cardEl.classList.add('disabled');
        cardEl.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.id.toUpperCase()}</div>
        `;
        cardEl.onclick = () => playCard(card);
        container.appendChild(cardEl);
    });
}

function playCard(card) {
    if (currentElixir < card.cost || !gameRunning) return;
    currentElixir -= card.cost;
    const x = activePlayer === 'player' ? 100 + Math.random() * 50 : canvas.width - 150 + Math.random() * 50;
    const y = 100 + Math.random() * (canvas.height - 200);
    createUnit(card, x, y, activePlayer);
    updateUI();

    if (gameMode === 'friend') {
        activePlayer = activePlayer === 'player' ? 'enemy' : 'player';
        renderCards();
    }
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
        target: null
    };
    if (side === 'player') playerUnits.push(unit);
    else enemyUnits.push(unit);
}

function startGame() {
    gameRunning = true;
    gameStartTime = Date.now();
    document.getElementById('startBtn').style.display = 'none';
    gameLoop();
}

function updateUI() {
    playerCrownsEl.textContent = playerCrowns;
    enemyCrownsEl.textContent = enemyCrowns;
    elixirCountEl.textContent = Math.floor(currentElixir);
    elixirFillEl.style.width = `${(currentElixir / MAX_ELIXIR) * 100}%`;
}

function gameLoop() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    const elapsed = Date.now() - gameStartTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    currentElixir = Math.min(MAX_ELIXIR, currentElixir + ELIXIR_RATE);

    // IA mejorada para modo bot
    if (gameMode === 'bot') {
        if (Math.random() < 0.02 && enemyHand.length > 0) {
            const card = enemyHand[Math.floor(Math.random() * enemyHand.length)];
            const x = canvas.width - 150 + Math.random() * 50;
            const y = 100 + Math.random() * (canvas.height - 200);
            createUnit(card, x, y, 'enemy');
        }
    }

    updateUnits(playerUnits, enemyTowers);
    updateUnits(enemyUnits, playerTowers);

    const playerKing = playerTowers.find(t => t.type === 'king');
    const enemyKing = enemyTowers.find(t => t.type === 'king');
    if (playerKing.health <= 0) return endGame('lose');
    if (enemyKing.health <= 0) return endGame('win');
    if (remaining <= 0) return endGame(playerCrowns > enemyCrowns ? 'win' : 'lose');

    updateUI();
}

function updateUnits(units, enemyTowers) {
    for (let i = units.length - 1; i >= 0; i--) {
        const unit = units[i];
        const target = enemyTowers.find(t => t.health > 0);
        if (!target) continue;

        const dist = Math.hypot(unit.x - target.x, unit.y - target.y);
        if (dist < unit.range) {
            target.health -= unit.damage;
            createDamageEffect(target.x, target.y, unit.damage);
            units.splice(i, 1);
            if (target.health <= 0) {
                if (target.side === 'player') enemyCrowns++;
                else playerCrowns++;
            }
        } else {
            const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
            unit.x += Math.cos(angle) * unit.speed;
            unit.y += Math.sin(angle) * unit.speed;
        }
    }
}

function createDamageEffect(x, y, damage) {
    damagePopups.push({ x, y, text: `-${damage}`, life: 60 });
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(canvas.width / 2 - 30, 50, 60, canvas.height - 100);

    [...playerTowers, ...enemyTowers].forEach(t => {
        if (t.health <= 0) return;
        ctx.fillStyle = t.type === 'king' ? '#e74c3c' : '#f39c12';
        ctx.fillRect(t.x - t.width / 2, t.y - t.height / 2, t.width, t.height);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(t.x - t.width / 2, t.y - t.height / 2 - 10, (t.health / t.maxHealth) * t.width, 5);
    });

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

    damagePopups.forEach((p, i) => {
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '12px Arial';
        ctx.fillText(p.text, p.x, p.y);
        p.y -= 1;
        p.life--;
        if (p.life <= 0) damagePopups.splice(i, 1);
    });
}

function endGame(result) {
    gameRunning = false;
    if (result === 'win') {
        document.getElementById('victoryCrowns').textContent = `${playerCrowns} - ${enemyCrowns}`;
        document.getElementById('victoryScreen').classList.add('active');
    } else {
        document.getElementById('finalCrowns').textContent = `${playerCrowns} - ${enemyCrowns}`;
        document.getElementById('gameOverScreen').classList.add('active');
    }
}

function resetGame() {
    gameRunning = false;
    document.getElementById('victoryScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
    document.getElementById('startBtn').style.display = 'none';
    setupGame();
}

// Iniciar
init();
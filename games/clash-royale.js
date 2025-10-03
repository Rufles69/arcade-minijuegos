// clash-royales.js - Versión completamente funcional

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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
const finalPlayerCrownsElement = document.getElementById('finalPlayerCrowns');
const finalEnemyCrownsElement = document.getElementById('finalEnemyCrowns');
const victoryPlayerCrownsElement = document.getElementById('victoryPlayerCrowns');
const victoryEnemyCrownsElement = document.getElementById('victoryEnemyCrowns');
const trophiesLostElement = document.getElementById('trophiesLost');
const trophiesWonElement = document.getElementById('trophiesWon');
const playerNameElement = document.getElementById('playerName');
const enemyNameElement = document.getElementById('enemyName');
const playerNameInput = document.getElementById('playerNameInput');
const playBtn = document.getElementById('playBtn');
const botModeBtn = document.getElementById('botModeBtn');
const friendModeBtn = document.getElementById('friendModeBtn');
const backBtn = document.getElementById('backBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const restartGameBtn = document.getElementById('restartGameBtn');
const menuBtn = document.getElementById('menuBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');
const resumeBtn = document.getElementById('resumeBtn');
const pausedMenuBtn = document.getElementById('pausedMenuBtn');
const victoryRestartBtn = document.getElementById('victoryRestartBtn');
const victoryMenuBtn = document.getElementById('victoryMenuBtn');
const cardsContainer = document.querySelector('.cards-container');

// Configuración del juego
const ARENA_WIDTH = 900;
const ARENA_HEIGHT = 600;
const ELIXIR_RATE = 0.02;
const DOUBLE_ELIXIR_TIME = 60000;
const GAME_DURATION = 180000;

// Variables del juego
let gameRunning = false;
let gamePaused = false;
let gameLoopId = null;
let lastTime = 0;
let gameStartTime = 0;
let doubleElixirActive = false;
let gameMode = 'bot';
let playerName = 'JUGADOR';
let enemyName = 'BOT';

// Estadísticas del juego
let playerCrowns = 0;
let enemyCrowns = 0;
let playerTrophies = 3000;
let currentElixir = 5;
let maxElixir = 10;

// Torres
let playerTowers = [];
let enemyTowers = [];

// Arrays de unidades y proyectiles
let playerUnits = [];
let enemyUnits = [];
let projectiles = [];
let damagePopups = [];

// Mazos y cartas
let playerDeck = [];
let enemyDeck = [];
let playerHand = [];
let enemyHand = [];
let nextEnemyCardTime = 0;

// Cartas disponibles
const allCards = {
    'barbarian': { cost: 5, type: 'troop', health: 300, damage: 50, speed: 2, range: 30, icon: '🪓', target: 'ground', color: '#e74c3c' },
    'archer': { cost: 3, type: 'troop', health: 150, damage: 30, speed: 1.5, range: 150, icon: '🏹', target: 'air&ground', color: '#f39c12' },
    'giant': { cost: 5, type: 'troop', health: 800, damage: 40, speed: 1, range: 35, icon: '👹', target: 'buildings', color: '#e67e22' },
    'knight': { cost: 3, type: 'troop', health: 400, damage: 45, speed: 2, range: 35, icon: '⚔️', target: 'ground', color: '#95a5a6' },
    'wizard': { cost: 5, type: 'troop', health: 200, damage: 60, speed: 1.2, range: 180, icon: '🔮', target: 'air&ground', color: '#9b59b6' },
    'minion': { cost: 3, type: 'troop', health: 100, damage: 40, speed: 2.5, range: 40, icon: '👺', target: 'air&ground', color: '#3498db' }
};

// Colores del juego
const colors = {
    background: '#0f3460',
    arena: '#27ae60',
    river: '#3498db',
    bridge: '#8B4513',
    playerSide: '#e74c3c',
    enemySide: '#3498db',
    healthBar: '#2ecc71',
    healthBarBackground: '#c0392b',
    text: '#ecf0f1',
    tower: '#f39c12',
    kingTower: '#e74c3c'
};

// Inicializar el juego
function init() {
    console.log('Inicializando Clash Royale...');
    
    // Configurar event listeners
    playBtn.addEventListener('click', showModeSelect);
    botModeBtn.addEventListener('click', () => selectMode('bot'));
    friendModeBtn.addEventListener('click', () => selectMode('friend'));
    backBtn.addEventListener('click', showStartScreen);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);
    restartGameBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', goToMenu);
    mainMenuBtn.addEventListener('click', goToMenu);
    resumeBtn.addEventListener('click', togglePause);
    pausedMenuBtn.addEventListener('click', goToMenu);
    victoryRestartBtn.addEventListener('click', resetGame);
    victoryMenuBtn.addEventListener('click', goToMenu);
    
    // Event listener para pausa con tecla P
    document.addEventListener('keydown', function(e) {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
    });
    
    // Actualizar nombre del jugador
    playerNameInput.addEventListener('input', function() {
        playerName = this.value || 'JUGADOR';
        playerNameElement.textContent = playerName;
    });
    
    // Inicializar nombres
    playerNameElement.textContent = playerName;
    enemyNameElement.textContent = enemyName;
    
    resetGame();
}

// Mostrar selección de modo
function showModeSelect() {
    startScreen.style.display = 'none';
    modeSelectScreen.style.display = 'flex';
}

// Mostrar pantalla de inicio
function showStartScreen() {
    modeSelectScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

// Seleccionar modo de juego - SIMPLIFICADO Y FUNCIONAL
function selectMode(mode) {
    gameMode = mode;
    
    if (mode === 'bot') {
        enemyName = 'BOT';
        enemyNameElement.textContent = enemyName;
        // Ocultar pantalla de selección y preparar el juego
        modeSelectScreen.style.display = 'none';
        setupGame();
        // Iniciar el juego automáticamente
        setTimeout(() => {
            startGame();
        }, 500);
    } else if (mode === 'friend') {
        enemyName = 'AMIGO';
        enemyNameElement.textContent = enemyName;
        
        // Crear pantalla de invitación temporal
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div class="mode-select-screen" style="display: flex;">
                <h2>INVITAR AMIGO</h2>
                <div class="invite-link">
                    <p>COMPARTE ESTE ENLACE CON TU AMIGO:</p>
                    <p>https://clashroyale.com/invite/${Math.random().toString(36).substr(2, 9)}</p>
                    <button class="copy-btn" id="tempCopyBtn">COPIAR ENLACE</button>
                </div>
                <div class="buttons">
                    <button class="btn" id="tempContinueBtn">CONTINUAR</button>
                    <button class="btn btn-secondary" id="tempCancelBtn">CANCELAR</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tempDiv);
        
        // Configurar event listeners para los nuevos botones
        document.getElementById('tempContinueBtn').addEventListener('click', function() {
            tempDiv.remove();
            setupGame();
            setTimeout(() => {
                startGame();
            }, 500);
        });
        
        document.getElementById('tempCancelBtn').addEventListener('click', function() {
            tempDiv.remove();
            showStartScreen();
        });
        
        document.getElementById('tempCopyBtn').addEventListener('click', function() {
            const linkText = document.querySelector('.invite-link p:last-child').textContent;
            navigator.clipboard.writeText(linkText)
                .then(() => alert('Enlace copiado al portapapeles'))
                .catch(() => alert('Error al copiar el enlace'));
        });
    }
}

// Configurar juego
function setupGame() {
    console.log('Configurando juego...');
    
    // Crear mazos
    createDecks();
    
    // Crear torres
    playerTowers = [
        { x: 100, y: 300, width: 70, height: 90, health: 3000, maxHealth: 3000, side: 'player', type: 'king', range: 250, damage: 50 },
        { x: 150, y: 150, width: 50, height: 70, health: 1500, maxHealth: 1500, side: 'player', type: 'princess', range: 200, damage: 40 },
        { x: 150, y: 450, width: 50, height: 70, health: 1500, maxHealth: 1500, side: 'player', type: 'princess', range: 200, damage: 40 }
    ];
    
    enemyTowers = [
        { x: 800, y: 300, width: 70, height: 90, health: 3000, maxHealth: 3000, side: 'enemy', type: 'king', range: 250, damage: 50 },
        { x: 750, y: 150, width: 50, height: 70, health: 1500, maxHealth: 1500, side: 'enemy', type: 'princess', range: 200, damage: 40 },
        { x: 750, y: 450, width: 50, height: 70, health: 1500, maxHealth: 1500, side: 'enemy', type: 'princess', range: 200, damage: 40 }
    ];
    
    // Actualizar UI
    updateUI();
    
    // Dibujar juego inicial
    drawGame();
    
    console.log('Juego configurado correctamente');
}

// Crear mazos
function createDecks() {
    // Mazo del jugador (6 cartas)
    const playerCardNames = ['barbarian', 'archer', 'giant', 'knight', 'wizard', 'minion'];
    playerDeck = playerCardNames.map(name => ({ ...allCards[name], id: name }));
    
    // Mazo del enemigo (6 cartas)
    const enemyCardNames = ['barbarian', 'archer', 'giant', 'knight', 'wizard', 'minion'];
    enemyDeck = enemyCardNames.map(name => ({ ...allCards[name], id: name }));
    
    // Repartir mano inicial (4 cartas)
    playerHand = playerDeck.slice(0, 4);
    enemyHand = enemyDeck.slice(0, 4);
    
    // Crear elementos HTML para las cartas del jugador
    createCardElements();
}

// Crear elementos HTML de cartas
function createCardElements() {
    cardsContainer.innerHTML = '';
    
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.setAttribute('data-card', card.id);
        cardElement.setAttribute('data-cost', card.cost);
        
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.id.toUpperCase()}</div>
        `;
        
        cardElement.addEventListener('click', function() {
            if (!gameRunning || gamePaused) return;
            
            if (currentElixir >= card.cost) {
                playCard(card, 'player');
            }
        });
        
        cardsContainer.appendChild(cardElement);
    });
    
    updateCardStates();
}

// Jugar una carta
function playCard(card, side) {
    if (side === 'player') {
        if (currentElixir < card.cost) return;
        currentElixir -= card.cost;
        updateUI();
        
        // Posición de despliegue (lado izquierdo para jugador)
        let deployX, deployY;
        
        deployX = 100 + Math.random() * 50;
        deployY = 100 + Math.random() * 400;
        
        // Crear unidad
        createUnit(card, deployX, deployY, 'player');
        
        // Rotar carta
        rotateCard(side);
        
    } else {
        // IA del enemigo juega carta
        let deployX, deployY;
        
        deployX = 750 + Math.random() * 50;
        deployY = 100 + Math.random() * 400;
        
        createUnit(card, deployX, deployY, 'enemy');
        
        rotateCard(side);
    }
}

// Crear unidad
function createUnit(card, x, y, side) {
    const unit = {
        x: x,
        y: y,
        width: 35,
        height: 35,
        type: card.id,
        health: card.health,
        maxHealth: card.health,
        damage: card.damage,
        speed: card.speed,
        range: card.range,
        target: card.target,
        currentTarget: null,
        side: side,
        attackCooldown: 0,
        icon: card.icon,
        color: card.color,
        lastAttackTime: 0
    };
    
    if (side === 'player') {
        playerUnits.push(unit);
    } else {
        enemyUnits.push(unit);
    }
}

// Rotar carta en la mano
function rotateCard(side) {
    if (side === 'player') {
        const playedCard = playerHand.shift();
        const newCard = playerDeck[playerHand.length % playerDeck.length];
        playerHand.push(newCard);
        createCardElements();
    } else {
        const playedCard = enemyHand.shift();
        const newCard = enemyDeck[enemyHand.length % enemyDeck.length];
        enemyHand.push(newCard);
        nextEnemyCardTime = Date.now() + 2000 + Math.random() * 3000;
    }
}

// Iniciar el juego - CORREGIDO
function startGame() {
    if (gameRunning) {
        console.log('El juego ya está en ejecución');
        return;
    }
    
    console.log('🚀 INICIANDO BATALLA 1vs1...');
    gameRunning = true;
    gamePaused = false;
    gameStartTime = Date.now();
    
    // Ocultar TODAS las pantallas
    const allScreens = document.querySelectorAll('.start-screen, .mode-select-screen, .game-over, .level-complete, .paused-screen');
    allScreens.forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Limpiar cualquier pantalla temporal
    const tempScreens = document.querySelectorAll('div[style*="display: flex"]');
    tempScreens.forEach(screen => {
        if (screen.classList.contains('mode-select-screen')) {
            screen.style.display = 'none';
        }
    });
    
    lastTime = performance.now();
    startGameLoop();
    
    console.log('✅ Juego iniciado correctamente');
}

// Toggle pausa
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pausedScreen.style.display = 'flex';
        cancelAnimationFrame(gameLoopId);
    } else {
        pausedScreen.style.display = 'none';
        lastTime = performance.now();
        startGameLoop();
    }
}

// Actualizar UI
function updateUI() {
    playerCrownsElement.textContent = playerCrowns;
    enemyCrownsElement.textContent = enemyCrowns;
    elixirCountElement.textContent = Math.floor(currentElixir);
    elixirFillElement.style.width = (currentElixir / maxElixir) * 100 + '%';
    
    updateCardStates();
}

// Actualizar estado de las cartas
function updateCardStates() {
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(card => {
        const cost = parseInt(card.dataset.cost);
        if (currentElixir < cost) {
            card.classList.add('disabled');
        } else {
            card.classList.remove('disabled');
        }
    });
}

// Reiniciar juego
function resetGame() {
    console.log('Reiniciando juego...');
    
    // Detener juego actual
    gameRunning = false;
    gamePaused = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    // Resetear variables
    playerCrowns = 0;
    enemyCrowns = 0;
    currentElixir = 5;
    doubleElixirActive = false;
    
    // Limpiar arrays
    playerUnits = [];
    enemyUnits = [];
    projectiles = [];
    damagePopups = [];
    
    // Mostrar pantalla de inicio
    startScreen.style.display = 'flex';
    gameOverElement.style.display = 'none';
    victoryScreen.style.display = 'none';
    pausedScreen.style.display = 'none';
    modeSelectScreen.style.display = 'none';
    
    // Configurar juego
    setupGame();
}

// Iniciar bucle del juego
function startGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Bucle principal del juego
function gameLoop(timestamp) {
    if (!gameRunning || gamePaused) {
        return;
    }
    
    const deltaTime = Math.min(timestamp - lastTime, 100) / 16.67;
    lastTime = timestamp;
    
    updateGame(deltaTime);
    drawGame();
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Actualizar estado del juego
function updateGame(deltaTime) {
    // Actualizar tiempo del juego
    updateGameTime();
    
    // Actualizar elixir
    updateElixir(deltaTime);
    
    // IA del enemigo
    updateEnemyAI();
    
    // Actualizar unidades
    updateUnits(playerUnits, enemyUnits, deltaTime);
    updateUnits(enemyUnits, playerUnits, deltaTime);
    
    // Actualizar proyectiles
    updateProjectiles(deltaTime);
    
    // Actualizar efectos
    updateEffects(deltaTime);
    
    // Verificar condiciones de victoria/derrota
    checkGameConditions();
    
    // Actualizar UI
    updateUI();
}

// Actualizar tiempo del juego
function updateGameTime() {
    const elapsed = Date.now() - gameStartTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Activar elixir doble en el último minuto
    if (remaining <= DOUBLE_ELIXIR_TIME && !doubleElixirActive) {
        doubleElixirActive = true;
        timerElement.style.color = '#9b59b6';
    }
    
    // Fin del juego por tiempo
    if (remaining <= 0) {
        endGameByTime();
    }
}

// Actualizar elixir
function updateElixir(deltaTime) {
    const elixirRate = doubleElixirActive ? ELIXIR_RATE * 2 : ELIXIR_RATE;
    currentElixir = Math.min(currentElixir + (elixirRate * deltaTime), maxElixir);
}

// IA del enemigo
function updateEnemyAI() {
    // El enemigo juega cartas periódicamente
    if (Date.now() >= nextEnemyCardTime && enemyHand.length > 0) {
        const playableCards = enemyHand.filter(card => true);
        
        if (playableCards.length > 0) {
            const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
            playCard(randomCard, 'enemy');
        }
        
        nextEnemyCardTime = Date.now() + 3000 + Math.random() * 4000;
    }
}

// Actualizar unidades
function updateUnits(units, enemyUnits, deltaTime) {
    const allTargets = [...enemyUnits, ...(units[0]?.side === 'player' ? enemyTowers : playerTowers)];
    
    for (let i = units.length - 1; i >= 0; i--) {
        const unit = units[i];
        
        // Reducir cooldown de ataque
        if (unit.attackCooldown > 0) {
            unit.attackCooldown -= deltaTime;
        }
        
        // Buscar objetivo
        if (!unit.currentTarget || unit.currentTarget.health <= 0) {
            unit.currentTarget = findTarget(unit, allTargets);
        }
        
        // Mover o atacar
        if (unit.currentTarget) {
            const distance = getDistance(unit, unit.currentTarget);
            
            if (distance <= unit.range) {
                // Atacar
                if (unit.attackCooldown <= 0) {
                    attackTarget(unit, unit.currentTarget);
                    unit.attackCooldown = 60; // 1 segundo de cooldown
                }
            } else {
                // Moverse hacia el objetivo
                const angle = Math.atan2(unit.currentTarget.y - unit.y, unit.currentTarget.x - unit.x);
                unit.x += Math.cos(angle) * unit.speed * deltaTime;
                unit.y += Math.sin(angle) * unit.speed * deltaTime;
            }
        }
        
        // Eliminar unidades muertas
        if (unit.health <= 0) {
            units.splice(i, 1);
        }
    }
}

// Encontrar objetivo
function findTarget(unit, targets) {
    let closestTarget = null;
    let closestDistance = Infinity;
    
    for (const target of targets) {
        if (target.health > 0) {
            const distance = getDistance(unit, target);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        }
    }
    
    return closestTarget;
}

// Calcular distancia
function getDistance(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

// Atacar objetivo
function attackTarget(unit, target) {
    if (unit.type === 'archer' || unit.type === 'wizard') {
        // Unidades de rango lanzan proyectiles
        const projectile = {
            x: unit.x,
            y: unit.y,
            target: target,
            damage: unit.damage,
            speed: 8,
            side: unit.side,
            type: unit.type
        };
        projectiles.push(projectile);
    } else {
        // Ataque cuerpo a cuerpo
        target.health -= unit.damage;
        createDamageEffect(target.x, target.y, unit.damage);
        
        // Verificar si se destruyó una torre
        if (target.health <= 0 && (target.type === 'king' || target.type === 'princess')) {
            onTowerDestroyed(target);
        }
    }
}

// Actualizar proyectiles
function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        if (!projectile.target || projectile.target.health <= 0) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Mover proyectil
        const angle = Math.atan2(projectile.target.y - projectile.y, projectile.target.x - projectile.x);
        projectile.x += Math.cos(angle) * projectile.speed * deltaTime;
        projectile.y += Math.sin(angle) * projectile.speed * deltaTime;
        
        // Verificar colisión
        const distance = getDistance(projectile, projectile.target);
        
        if (distance < 30) {
            // Golpear objetivo
            projectile.target.health -= projectile.damage;
            createDamageEffect(projectile.target.x, projectile.target.y, projectile.damage);
            
            // Verificar si se destruyó una torre
            if (projectile.target.health <= 0 && (projectile.target.type === 'king' || projectile.target.type === 'princess')) {
                onTowerDestroyed(projectile.target);
            }
            
            projectiles.splice(i, 1);
        }
        
        // Eliminar proyectiles fuera de la pantalla
        if (projectile.x < 0 || projectile.x > ARENA_WIDTH || projectile.y < 0 || projectile.y > ARENA_HEIGHT) {
            projectiles.splice(i, 1);
        }
    }
}

// Crear efecto de daño
function createDamageEffect(x, y, damage) {
    damagePopups.push({
        x: x,
        y: y,
        text: '-' + damage,
        life: 60,
        alpha: 1
    });
}

// Actualizar efectos
function updateEffects(deltaTime) {
    for (let i = damagePopups.length - 1; i >= 0; i--) {
        const popup = damagePopups[i];
        popup.life -= deltaTime;
        popup.y -= 0.5 * deltaTime;
        popup.alpha = popup.life / 60;
        
        if (popup.life <= 0) {
            damagePopups.splice(i, 1);
        }
    }
}

// Cuando se destruye una torre
function onTowerDestroyed(tower) {
    if (tower.side === 'player') {
        enemyCrowns++;
        if (tower.type === 'king') {
            gameOver();
        }
    } else {
        playerCrowns++;
        if (tower.type === 'king') {
            victory();
        }
    }
}

// Verificar condiciones del juego
function checkGameConditions() {
    // Verificar si el jugador perdió (Rey destruido)
    const playerKing = playerTowers.find(t => t.type === 'king');
    if (playerKing && playerKing.health <= 0) {
        gameOver();
        return;
    }
    
    // Verificar si el jugador ganó (Rey enemigo destruido)
    const enemyKing = enemyTowers.find(t => t.type === 'king');
    if (enemyKing && enemyKing.health <= 0) {
        victory();
        return;
    }
}

// Fin del juego por tiempo
function endGameByTime() {
    gameRunning = false;
    
    if (playerCrowns > enemyCrowns) {
        victory();
    } else if (enemyCrowns > playerCrowns) {
        gameOver();
    } else {
        // Empate
        gameOver();
    }
}

// Game Over
function gameOver() {
    console.log('Game Over!');
    
    gameRunning = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    const trophiesLost = 30;
    playerTrophies = Math.max(0, playerTrophies - trophiesLost);
    
    // Mostrar pantalla de game over
    finalPlayerCrownsElement.textContent = playerCrowns;
    finalEnemyCrownsElement.textContent = enemyCrowns;
    trophiesLostElement.textContent = '-' + trophiesLost;
    gameOverElement.style.display = 'flex';
}

// Victoria
function victory() {
    console.log('Victoria!');
    
    gameRunning = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    const trophiesWon = 30;
    playerTrophies += trophiesWon;
    
    // Mostrar pantalla de victoria
    victoryPlayerCrownsElement.textContent = playerCrowns;
    victoryEnemyCrownsElement.textContent = enemyCrowns;
    trophiesWonElement.textContent = '+' + trophiesWon;
    victoryScreen.style.display = 'flex';
}

// Volver al menú
function goToMenu() {
    console.log('Volviendo al menú...');
    
    // Detener el juego
    gameRunning = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    resetGame();
}

// =============================================
// SISTEMA DE DIBUJO
// =============================================

function drawGame() {
    // Limpiar canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    
    // Dibujar arena
    drawArena();
    
    // Dibujar torres
    drawTowers();
    
    // Dibujar unidades
    drawUnits();
    
    // Dibujar proyectiles
    drawProjectiles();
    
    // Dibujar efectos
    drawEffects();
    
    // Dibujar UI del juego
    drawGameUI();
}

function drawArena() {
    // Campo de batalla principal
    ctx.fillStyle = colors.arena;
    ctx.fillRect(50, 50, ARENA_WIDTH - 100, ARENA_HEIGHT - 100);
    
    // Río en el medio
    ctx.fillStyle = colors.river;
    ctx.fillRect(ARENA_WIDTH/2 - 30, 50, 60, ARENA_HEIGHT - 100);
    
    // Puentes
    ctx.fillStyle = colors.bridge;
    ctx.fillRect(ARENA_WIDTH/2 - 35, 200, 70, 25);
    ctx.fillRect(ARENA_WIDTH/2 - 35, 400, 70, 25);
    
    // Línea media
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH/2, 50);
    ctx.lineTo(ARENA_WIDTH/2, ARENA_HEIGHT - 50);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Zonas de despliegue
    ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
    ctx.fillRect(50, 50, ARENA_WIDTH/2 - 80, ARENA_HEIGHT - 100);
    
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fillRect(ARENA_WIDTH/2 + 30, 50, ARENA_WIDTH/2 - 80, ARENA_HEIGHT - 100);
}

function drawTowers() {
    // Dibujar torres del jugador
    playerTowers.forEach(tower => {
        if (tower.health <= 0) return;
        drawTower(tower);
    });
    
    // Dibujar torres del enemigo
    enemyTowers.forEach(tower => {
        if (tower.health <= 0) return;
        drawTower(tower);
    });
}

function drawTower(tower) {
    const isKing = tower.type === 'king';
    const color = isKing ? colors.kingTower : colors.tower;
    
    // Base de la torre
    ctx.fillStyle = color;
    ctx.fillRect(tower.x - tower.width/2, tower.y - tower.height/2, tower.width, tower.height);
    
    // Detalles de la torre
    ctx.fillStyle = '#f1c40f';
    if (isKing) {
        // Corona del rey
        ctx.fillRect(tower.x - 15, tower.y - 40, 30, 10);
        ctx.fillRect(tower.x - 10, tower.y - 30, 20, 5);
    } else {
        // Almenas de la princesa
        for (let i = -20; i <= 20; i += 10) {
            ctx.fillRect(tower.x + i, tower.y - 35, 5, 8);
        }
    }
    
    // Barra de salud
    const healthPercent = tower.health / tower.maxHealth;
    const barWidth = tower.width;
    const barHeight = 6;
    
    ctx.fillStyle = colors.healthBarBackground;
    ctx.fillRect(tower.x - tower.width/2, tower.y - tower.height/2 - 12, barWidth, barHeight);
    
    ctx.fillStyle = healthPercent > 0.3 ? colors.healthBar : '#ff6b6b';
    ctx.fillRect(tower.x - tower.width/2, tower.y - tower.height/2 - 12, barWidth * healthPercent, barHeight);
    
    // Borde
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(tower.x - tower.width/2, tower.y - tower.height/2, tower.width, tower.height);
}

function drawUnits() {
    // Dibujar unidades del jugador
    playerUnits.forEach(unit => {
        if (unit.health <= 0) return;
        drawUnit(unit);
    });
    
    // Dibujar unidades enemigas
    enemyUnits.forEach(unit => {
        if (unit.health <= 0) return;
        drawUnit(unit);
    });
}

function drawUnit(unit) {
    // Cuerpo de la unidad
    ctx.fillStyle = unit.color || (unit.side === 'player' ? colors.playerSide : colors.enemySide);
    
    // Tropa
    ctx.beginPath();
    ctx.arc(unit.x, unit.y, unit.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Icono de la unidad
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.icon, unit.x, unit.y);
    
    // Barra de salud
    const healthPercent = unit.health / unit.maxHealth;
    const barWidth = unit.width;
    const barHeight = 4;
    const barY = unit.y - unit.height/2 - 8;
    
    ctx.fillStyle = colors.healthBarBackground;
    ctx.fillRect(unit.x - unit.width/2, barY, barWidth, barHeight);
    
    ctx.fillStyle = healthPercent > 0.3 ? colors.healthBar : '#ff6b6b';
    ctx.fillRect(unit.x - unit.width/2, barY, barWidth * healthPercent, barHeight);
    
    // Borde
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(unit.x, unit.y, unit.width/2, 0, Math.PI * 2);
    ctx.stroke();
}

function drawProjectiles() {
    projectiles.forEach(projectile => {
        if (projectile.type === 'archer') {
            // Flecha
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(projectile.x, projectile.y);
            ctx.lineTo(projectile.x - 10, projectile.y - 3);
            ctx.lineTo(projectile.x - 10, projectile.y + 3);
            ctx.closePath();
            ctx.fill();
        } else if (projectile.type === 'wizard') {
            // Bola de energía
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawEffects() {
    damagePopups.forEach(popup => {
        ctx.save();
        ctx.globalAlpha = popup.alpha;
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(popup.text, popup.x, popup.y);
        ctx.restore();
    });
}

function drawGameUI() {
    // Información del elixir doble
    if (doubleElixirActive) {
        ctx.fillStyle = '#9b59b6';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ ELIXIR DOBLE ⚡', ARENA_WIDTH/2, 30);
    }
}

// Iniciar cuando se carga la página
window.addEventListener('load', init);
// clash-royale.js - Mini juego estilo Clash Royale

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const crownsElement = document.getElementById('crowns');
const elixirElement = document.getElementById('elixir');
const levelElement = document.getElementById('level');
const elixirFillElement = document.getElementById('elixirFill');
const startScreen = document.getElementById('startScreen');
const gameOverElement = document.getElementById('gameOver');
const levelCompleteElement = document.getElementById('levelComplete');
const pausedScreen = document.getElementById('pausedScreen');
const finalCrownsElement = document.getElementById('finalCrowns');
const finalLevelElement = document.getElementById('finalLevel');
const earnedStarsElement = document.getElementById('earnedStars');
const nextLevelElement = document.getElementById('nextLevel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const cards = document.querySelectorAll('.card');
const stars = document.querySelectorAll('.star');

// Configuración del juego
const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const ELIXIR_RATE = 0.02; // Velocidad de regeneración de elixir

// Variables del juego
let gameRunning = false;
let gamePaused = false;
let gameLoopId = null;
let lastTime = 0;

// Estadísticas del juego
let crowns = 0;
let elixir = 5;
let level = 1;
let playerHealth = 3000;
let enemyHealth = 3000;

// Arrays de unidades y proyectiles
let playerUnits = [];
let enemyUnits = [];
let projectiles = [];
let buildings = [];

// Cartas disponibles
const cardsData = {
    'barbarian': { cost: 5, type: 'melee', health: 300, damage: 50, speed: 2, range: 30, icon: '🪓' },
    'archer': { cost: 3, type: 'ranged', health: 150, damage: 30, speed: 1.5, range: 150, icon: '🏹' },
    'giant': { cost: 5, type: 'tank', health: 800, damage: 40, speed: 1, range: 35, icon: '👹' },
    'knight': { cost: 3, type: 'melee', health: 400, damage: 45, speed: 2, range: 35, icon: '⚔️' },
    'wizard': { cost: 5, type: 'ranged', health: 200, damage: 60, speed: 1.2, range: 180, icon: '🔮' }
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
    text: '#ecf0f1'
};

// Inicializar el juego
function init() {
    console.log('Inicializando Clash Royale...');
    
    // Configurar event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', goToMenu);
    
    // Event listeners para cartas
    cards.forEach(card => {
        card.addEventListener('click', function() {
            if (!gameRunning || gamePaused) return;
            
            const cardType = this.dataset.card;
            const cardCost = parseInt(this.dataset.cost);
            
            if (elixir >= cardCost) {
                playCard(cardType);
            }
        });
    });
    
    // Event listener para pausa con tecla P
    document.addEventListener('keydown', function(e) {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
    });
    
    resetGame();
    drawGame();
}

// Iniciar el juego
function startGame() {
    if (gameRunning) return;
    
    console.log('Iniciando batalla...');
    gameRunning = true;
    gamePaused = false;
    startScreen.style.display = 'none';
    pausedScreen.style.display = 'none';
    lastTime = performance.now();
    startGameLoop();
}

// Jugar una carta
function playCard(cardType) {
    const cardData = cardsData[cardType];
    
    if (elixir < cardData.cost) return;
    
    elixir -= cardData.cost;
    updateUI();
    
    // Crear unidad en el lado izquierdo (jugador)
    const unit = {
        x: 100,
        y: Math.random() * 400 + 100, // Posición aleatoria en el campo del jugador
        width: 40,
        height: 40,
        type: cardType,
        health: cardData.health,
        maxHealth: cardData.health,
        damage: cardData.damage,
        speed: cardData.speed,
        range: cardData.range,
        target: null,
        side: 'player',
        attackCooldown: 0,
        icon: cardData.icon
    };
    
    playerUnits.push(unit);
    
    // Efecto visual al jugar carta
    createCardEffect(100, unit.y, cardData.icon);
}

// Crear efecto visual de carta
function createCardEffect(x, y, icon) {
    const effect = {
        x: x,
        y: y,
        icon: icon,
        size: 50,
        alpha: 1,
        duration: 60
    };
    
    // Agregar efecto temporal (se dibuja pero no actualiza)
    setTimeout(() => {
        drawCardEffect(effect);
    }, 0);
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
    crownsElement.textContent = crowns;
    elixirElement.textContent = Math.floor(elixir);
    levelElement.textContent = level;
    elixirFillElement.style.width = (elixir / 10) * 100 + '%';
    
    // Actualizar estado de las cartas
    cards.forEach(card => {
        const cost = parseInt(card.dataset.cost);
        if (elixir < cost) {
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
    crowns = 0;
    elixir = 5;
    level = 1;
    playerHealth = 3000;
    enemyHealth = 3000;
    
    // Limpiar arrays
    playerUnits = [];
    enemyUnits = [];
    projectiles = [];
    buildings = [];
    
    // Configurar nivel
    setupLevel();
    
    // Actualizar UI
    updateUI();
    
    // Mostrar pantalla de inicio
    startScreen.style.display = 'flex';
    gameOverElement.style.display = 'none';
    levelCompleteElement.style.display = 'none';
    pausedScreen.style.display = 'none';
    
    // Resetear estrellas
    stars.forEach(star => star.classList.remove('active'));
    
    drawGame();
}

// Configurar nivel
function setupLevel() {
    // Crear edificios (torres)
    buildings = [
        // Torre del jugador (izquierda)
        { x: 50, y: 300, width: 60, height: 80, health: playerHealth, maxHealth: playerHealth, side: 'player', type: 'tower' },
        // Torre del enemigo (derecha)
        { x: 690, y: 300, width: 60, height: 80, health: enemyHealth, maxHealth: enemyHealth, side: 'enemy', type: 'tower' }
    ];
    
    // Unidades iniciales del enemigo basadas en el nivel
    spawnEnemyUnits();
}

// Generar unidades enemigas
function spawnEnemyUnits() {
    const enemyTypes = ['barbarian', 'archer', 'knight'];
    const unitCount = 2 + level;
    
    for (let i = 0; i < unitCount; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const cardData = cardsData[type];
        
        const unit = {
            x: 700,
            y: Math.random() * 400 + 100,
            width: 40,
            height: 40,
            type: type,
            health: cardData.health,
            maxHealth: cardData.health,
            damage: cardData.damage,
            speed: cardData.speed,
            range: cardData.range,
            target: null,
            side: 'enemy',
            attackCooldown: 0,
            icon: cardData.icon
        };
        
        enemyUnits.push(unit);
    }
}

// Siguiente nivel
function nextLevel() {
    level++;
    crowns = 0;
    playerHealth = 3000 + (level * 500);
    enemyHealth = 3000 + (level * 500);
    gameRunning = false;
    levelCompleteElement.style.display = 'none';
    
    setupLevel();
    updateUI();
    startScreen.style.display = 'flex';
    drawGame();
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
    // Regenerar elixir
    elixir = Math.min(elixir + (ELIXIR_RATE * deltaTime), 10);
    
    // Spawn aleatorio de unidades enemigas
    if (Math.random() < 0.005 * level && enemyUnits.length < 5 + level) {
        spawnEnemyUnits();
    }
    
    // Actualizar unidades del jugador
    updateUnits(playerUnits, enemyUnits, buildings, deltaTime);
    
    // Actualizar unidades enemigas
    updateUnits(enemyUnits, playerUnits, buildings, deltaTime);
    
    // Actualizar proyectiles
    updateProjectiles(deltaTime);
    
    // Actualizar edificios
    updateBuildings();
    
    // Verificar condiciones de victoria/derrota
    checkGameConditions();
    
    // Actualizar UI
    updateUI();
}

// Actualizar unidades
function updateUnits(units, enemyUnits, buildings, deltaTime) {
    for (let i = units.length - 1; i >= 0; i--) {
        const unit = units[i];
        
        // Reducir cooldown de ataque
        if (unit.attackCooldown > 0) {
            unit.attackCooldown -= deltaTime;
        }
        
        // Buscar objetivo
        if (!unit.target || unit.target.health <= 0) {
            unit.target = findTarget(unit, enemyUnits, buildings);
        }
        
        // Mover o atacar
        if (unit.target) {
            const distance = Math.sqrt(
                Math.pow(unit.x - unit.target.x, 2) + 
                Math.pow(unit.y - unit.target.y, 2)
            );
            
            if (distance <= unit.range) {
                // Atacar
                if (unit.attackCooldown <= 0) {
                    attackTarget(unit, unit.target);
                    unit.attackCooldown = 60; // 1 segundo de cooldown
                }
            } else {
                // Moverse hacia el objetivo
                const angle = Math.atan2(unit.target.y - unit.y, unit.target.x - unit.x);
                unit.x += Math.cos(angle) * unit.speed * deltaTime;
                unit.y += Math.sin(angle) * unit.speed * deltaTime;
            }
        } else {
            // Moverse hacia el lado enemigo
            const direction = unit.side === 'player' ? 1 : -1;
            unit.x += unit.speed * direction * deltaTime;
        }
        
        // Eliminar unidades muertas
        if (unit.health <= 0) {
            units.splice(i, 1);
        }
        
        // Limitar movimiento dentro de la arena
        unit.x = Math.max(50, Math.min(750, unit.x));
        unit.y = Math.max(50, Math.min(550, unit.y));
    }
}

// Encontrar objetivo
function findTarget(unit, enemyUnits, buildings) {
    // Priorizar edificios para ciertas unidades
    if (unit.type === 'giant') {
        const enemyBuildings = buildings.filter(b => b.side !== unit.side && b.health > 0);
        if (enemyBuildings.length > 0) {
            return enemyBuildings[0];
        }
    }
    
    // Buscar unidades enemigas cercanas
    let closestTarget = null;
    let closestDistance = Infinity;
    
    for (const enemy of enemyUnits) {
        if (enemy.health > 0) {
            const distance = Math.sqrt(
                Math.pow(unit.x - enemy.x, 2) + 
                Math.pow(unit.y - enemy.y, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = enemy;
            }
        }
    }
    
    // Si no hay unidades, buscar edificios
    if (!closestTarget) {
        const enemyBuildings = buildings.filter(b => b.side !== unit.side && b.health > 0);
        for (const building of enemyBuildings) {
            const distance = Math.sqrt(
                Math.pow(unit.x - building.x, 2) + 
                Math.pow(unit.y - building.y, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = building;
            }
        }
    }
    
    return closestTarget;
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
        // Unidades cuerpo a cuerpo atacan directamente
        target.health -= unit.damage;
        
        // Efecto de daño
        createDamageEffect(target.x, target.y, unit.damage);
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
        const distance = Math.sqrt(
            Math.pow(projectile.x - projectile.target.x, 2) + 
            Math.pow(projectile.y - projectile.target.y, 2)
        );
        
        if (distance < 30) {
            // Golpear objetivo
            projectile.target.health -= projectile.damage;
            createDamageEffect(projectile.target.x, projectile.target.y, projectile.damage);
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
    // Efecto visual temporal (se dibuja en el siguiente frame)
    setTimeout(() => {
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Arial';
        ctx.fillText('-' + damage, x, y - 20);
    }, 0);
}

// Actualizar edificios
function updateBuildings() {
    for (const building of buildings) {
        if (building.health <= 0 && building.type === 'tower') {
            // Torre destruida
            if (building.side === 'enemy') {
                crowns++;
                if (crowns >= 3) {
                    levelComplete();
                }
            } else {
                gameOver();
            }
        }
    }
}

// Verificar condiciones del juego
function checkGameConditions() {
    // Verificar si el jugador perdió
    const playerTower = buildings.find(b => b.side === 'player' && b.type === 'tower');
    if (playerTower && playerTower.health <= 0) {
        gameOver();
        return;
    }
    
    // Verificar si el jugador ganó
    const enemyTower = buildings.find(b => b.side === 'enemy' && b.type === 'tower');
    if (enemyTower && enemyTower.health <= 0) {
        crowns++;
        if (crowns >= 3) {
            levelComplete();
        } else {
            // Resetear torre enemiga para siguiente corona
            enemyTower.health = enemyTower.maxHealth;
        }
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
    
    // Calcular estrellas
    let starsEarned = Math.min(3, Math.floor(level / 2));
    starsEarned = Math.max(1, starsEarned);
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    // Guardar progreso
    saveProgress(starsEarned);
    
    // Mostrar pantalla de game over
    finalCrownsElement.textContent = crowns;
    finalLevelElement.textContent = level;
    earnedStarsElement.textContent = starsEarned;
    gameOverElement.style.display = 'flex';
}

// Completar nivel
function levelComplete() {
    console.log('Nivel completado!');
    
    gameRunning = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    // Calcular estrellas
    let starsEarned = Math.min(3, level);
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    // Guardar progreso
    saveProgress(starsEarned);
    
    // Mostrar pantalla de nivel completado
    nextLevelElement.textContent = level + 1;
    levelCompleteElement.style.display = 'flex';
}

// Guardar progreso
function saveProgress(starsEarned) {
    try {
        const currentLevel = parseInt(localStorage.getItem('clash-royale-highscore')) || 0;
        const newLevel = Math.max(currentLevel, level);
        localStorage.setItem('clash-royale-highscore', newLevel.toString());
        
        const currentStars = parseInt(localStorage.getItem('clash-royale-stars')) || 0;
        const newStars = currentStars + starsEarned;
        localStorage.setItem('clash-royale-stars', newStars.toString());
        
        console.log('Progreso guardado:', { level: newLevel, stars: newStars });
    } catch (error) {
        console.error('Error guardando progreso:', error);
    }
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
    
    try {
        // Intentar navegar al index.html
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const indexUrl = basePath ? `${basePath}/index.html` : '../index.html';
        
        window.location.href = indexUrl;
    } catch (error) {
        console.error('Error volviendo al menú:', error);
        alert('Batalla reiniciada. Para volver al menú principal, cierra esta pestaña.');
        resetGame();
    }
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
    
    // Dibujar edificios
    drawBuildings();
    
    // Dibujar unidades
    drawUnits();
    
    // Dibujar proyectiles
    drawProjectiles();
    
    // Dibujar UI del juego
    drawGameUI();
}

function drawArena() {
    // Campo de batalla
    ctx.fillStyle = colors.arena;
    ctx.fillRect(50, 50, ARENA_WIDTH - 100, ARENA_HEIGHT - 100);
    
    // Río en el medio
    ctx.fillStyle = colors.river;
    ctx.fillRect(ARENA_WIDTH/2 - 25, 50, 50, ARENA_HEIGHT - 100);
    
    // Puentes
    ctx.fillStyle = colors.bridge;
    ctx.fillRect(ARENA_WIDTH/2 - 30, 200, 60, 30);
    ctx.fillRect(ARENA_WIDTH/2 - 30, 400, 60, 30);
    
    // Línea media
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH/2, 50);
    ctx.lineTo(ARENA_WIDTH/2, ARENA_HEIGHT - 50);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Zona del jugador (izquierda)
    ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
    ctx.fillRect(50, 50, ARENA_WIDTH/2 - 50, ARENA_HEIGHT - 100);
    
    // Zona del enemigo (derecha)
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fillRect(ARENA_WIDTH/2, 50, ARENA_WIDTH/2 - 50, ARENA_HEIGHT - 100);
}

function drawBuildings() {
    for (const building of buildings) {
        if (building.health <= 0) continue;
        
        // Torre
        ctx.fillStyle = building.side === 'player' ? colors.playerSide : colors.enemySide;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Detalles de la torre
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(building.x + 10, building.y + 10, building.width - 20, 10);
        ctx.fillRect(building.x + 15, building.y + 25, building.width - 30, 10);
        ctx.fillRect(building.x + 20, building.y + 40, building.width - 40, 10);
        
        // Barra de salud
        const healthPercent = building.health / building.maxHealth;
        const barWidth = building.width;
        const barHeight = 8;
        
        ctx.fillStyle = colors.healthBarBackground;
        ctx.fillRect(building.x, building.y - 15, barWidth, barHeight);
        
        ctx.fillStyle = colors.healthBar;
        ctx.fillRect(building.x, building.y - 15, barWidth * healthPercent, barHeight);
        
        // Borde
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(building.x, building.y, building.width, building.height);
    }
}

function drawUnits() {
    // Dibujar unidades del jugador
    for (const unit of playerUnits) {
        drawUnit(unit);
    }
    
    // Dibujar unidades enemigas
    for (const unit of enemyUnits) {
        drawUnit(unit);
    }
}

function drawUnit(unit) {
    // Cuerpo de la unidad
    ctx.fillStyle = unit.side === 'player' ? colors.playerSide : colors.enemySide;
    ctx.fillRect(unit.x - unit.width/2, unit.y - unit.height/2, unit.width, unit.height);
    
    // Icono de la unidad
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.icon, unit.x, unit.y);
    
    // Barra de salud
    const healthPercent = unit.health / unit.maxHealth;
    const barWidth = unit.width;
    const barHeight = 4;
    
    ctx.fillStyle = colors.healthBarBackground;
    ctx.fillRect(unit.x - unit.width/2, unit.y - unit.height/2 - 10, barWidth, barHeight);
    
    ctx.fillStyle = colors.healthBar;
    ctx.fillRect(unit.x - unit.width/2, unit.y - unit.height/2 - 10, barWidth * healthPercent, barHeight);
    
    // Borde
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.strokeRect(unit.x - unit.width/2, unit.y - unit.height/2, unit.width, unit.height);
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        if (projectile.type === 'archer') {
            // Flecha
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (projectile.type === 'wizard') {
            // Bola de fuego
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawGameUI() {
    // Coronas
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('👑 ' + crowns + '/3', 20, 30);
    
    // Elixir
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('⚗️ ' + Math.floor(elixir) + '/10', 100, 30);
    
    // Nivel
    ctx.fillStyle = '#3498db';
    ctx.fillText('⭐ Nivel ' + level, 200, 30);
}

function drawCardEffect(effect) {
    ctx.save();
    ctx.globalAlpha = effect.alpha;
    ctx.font = effect.size + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(effect.icon, effect.x, effect.y);
    ctx.restore();
}

// Iniciar cuando se carga la página
window.addEventListener('load', init);
// ghost-maze.js - Juego Pac-Man (MOVIMIENTO Y COLISIONES COMPLETAMENTE CORREGIDOS)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const powerElement = document.getElementById('power');
const startScreen = document.getElementById('startScreen');
const gameOverElement = document.getElementById('gameOver');
const levelCompleteElement = document.getElementById('levelComplete');
const pausedScreen = document.getElementById('pausedScreen');
const finalLevelElement = document.getElementById('finalLevel');
const finalScoreElement = document.getElementById('finalScore');
const earnedStarsElement = document.getElementById('earnedStars');
const nextLevelElement = document.getElementById('nextLevel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const stars = document.querySelectorAll('.star');
const mobileBtns = document.querySelectorAll('.mobile-btn');

// Configuración del juego
const TILE_SIZE = 20;
const GRID_WIDTH = 19;
const GRID_HEIGHT = 21;

// Variables del juego
let pacman = {
    x: 9,
    y: 15,
    direction: 0, // 0: right, 1: down, 2: left, 3: up
    nextDirection: 0,
    speed: 3.5,
    animation: 0,
    mouthOpen: true,
    radius: 8,
    pixelX: 9 * TILE_SIZE + TILE_SIZE / 2,
    pixelY: 15 * TILE_SIZE + TILE_SIZE / 2
};

let ghosts = [];
let dots = [];
let powerPellets = [];
let fruits = [];
let maze = [];
let level = 1;
let score = 0;
let lives = 3;
let powerMode = false;
let powerTimer = 0;
let gameRunning = false;
let gamePaused = false;
let keys = {};
let dotsCollected = 0;
let totalDots = 0;
let gameLoopId = null;
let lastTime = 0;

// Colores
const colors = {
    wall: '#1a35de',
    path: '#000',
    dot: '#ffd700',
    powerPellet: '#ff6b6b',
    pacman: '#ffd700',
    ghostRed: '#ff0000',
    ghostPink: '#ffb8ff',
    ghostCyan: '#00ffff',
    ghostOrange: '#ffb852',
    ghostScared: '#0000ff',
    ghostEyes: '#ffffff',
    fruit: '#ff4757',
    text: '#ffffff'
};

// Inicializar el juego
function init() {
    console.log('Inicializando Ghost Maze...');
    
    // Configurar event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Botones fuera del juego
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', goToMenu);
    
    // Controles móviles
    mobileBtns.forEach(btn => {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const direction = this.getAttribute('data-direction');
            handleMobileDirection(direction);
        });
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const direction = this.getAttribute('data-direction');
            handleMobileDirection(direction);
        });
    });
    
    resetGame();
    drawGame();
}

// Manejar teclas presionadas
function handleKeyDown(e) {
    keys[e.key] = true;
    
    switch(e.key) {
        case 'ArrowUp':
            pacman.nextDirection = 3;
            break;
        case 'ArrowDown':
            pacman.nextDirection = 1;
            break;
        case 'ArrowLeft':
            pacman.nextDirection = 2;
            break;
        case 'ArrowRight':
            pacman.nextDirection = 0;
            break;
        case ' ':
            e.preventDefault();
            if (!gameRunning && !gamePaused) {
                startGame();
            } else if (gameRunning) {
                togglePause();
            }
            break;
        case 'Escape':
        case 'p':
        case 'P':
            if (gameRunning) {
                togglePause();
            }
            break;
    }
}

// Manejar teclas liberadas
function handleKeyUp(e) {
    keys[e.key] = false;
}

// Manejar direcciones móviles
function handleMobileDirection(direction) {
    if (gamePaused) return;
    
    if (!gameRunning) {
        startGame();
        return;
    }
    
    switch(direction) {
        case 'up':
            pacman.nextDirection = 3;
            break;
        case 'down':
            pacman.nextDirection = 1;
            break;
        case 'left':
            pacman.nextDirection = 2;
            break;
        case 'right':
            pacman.nextDirection = 0;
            break;
    }
}

// Iniciar el juego
function startGame() {
    if (gameRunning) return;
    
    console.log('Iniciando juego...');
    gameRunning = true;
    gamePaused = false;
    startScreen.style.display = 'none';
    pausedScreen.style.display = 'none';
    lastTime = performance.now();
    startGameLoop();
}

// Pausar/Reanudar
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pausedScreen.style.display = 'flex';
        cancelAnimationFrame(gameLoopId);
        console.log('Juego pausado');
    } else {
        pausedScreen.style.display = 'none';
        lastTime = performance.now();
        startGameLoop();
        console.log('Juego reanudado');
    }
}

// Actualizar interfaz de usuario
function updateUI() {
    levelElement.textContent = level;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    powerElement.textContent = Math.max(0, Math.floor(powerTimer / 60));
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
    level = 1;
    score = 0;
    lives = 3;
    powerMode = false;
    powerTimer = 0;
    dotsCollected = 0;
    
    // Resetear Pac-Man
    pacman.x = 9;
    pacman.y = 15;
    pacman.direction = 0;
    pacman.nextDirection = 0;
    pacman.animation = 0;
    pacman.mouthOpen = true;
    pacman.pixelX = 9 * TILE_SIZE + TILE_SIZE / 2;
    pacman.pixelY = 15 * TILE_SIZE + TILE_SIZE / 2;
    
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
    // Crear laberinto
    createMaze();
    
    // Crear puntos
    createDots();
    
    // Crear power pellets
    createPowerPellets();
    
    // Crear frutas
    createFruits();
    
    // Crear fantasmas
    createGhosts();
    
    totalDots = dots.length;
    dotsCollected = 0;
}

// Crear laberinto
function createMaze() {
    // Laberinto clásico de Pac-Man
    maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
        [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
        [1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1],
        [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],
        [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
        [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
        [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
}

// Crear puntos
function createDots() {
    dots = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === 0) {
                // No poner puntos en el área central de los fantasmas
                if (!(x >= 8 && x <= 10 && y >= 8 && y <= 10)) {
                    dots.push({x, y});
                }
            }
        }
    }
}

// Crear power pellets
function createPowerPellets() {
    powerPellets = [
        {x: 1, y: 1},
        {x: 17, y: 1},
        {x: 1, y: 19},
        {x: 17, y: 19}
    ];
}

// Crear frutas
function createFruits() {
    fruits = [
        {x: 9, y: 10, type: 'cherry', points: 100}
    ];
}

// Crear fantasmas
function createGhosts() {
    ghosts = [
        {
            x: 9,
            y: 8,
            pixelX: 9 * TILE_SIZE + TILE_SIZE / 2,
            pixelY: 8 * TILE_SIZE + TILE_SIZE / 2,
            color: colors.ghostRed,
            name: 'Blinky',
            direction: 2,
            speed: 2.2,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: false,
            releaseTimer: 0,
            radius: 8,
            lastTurnX: 9,
            lastTurnY: 8
        },
        {
            x: 8,
            y: 9,
            pixelX: 8 * TILE_SIZE + TILE_SIZE / 2,
            pixelY: 9 * TILE_SIZE + TILE_SIZE / 2,
            color: colors.ghostPink,
            name: 'Pinky',
            direction: 0,
            speed: 2.0,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: true,
            releaseTimer: 500,
            radius: 8,
            lastTurnX: 8,
            lastTurnY: 9
        },
        {
            x: 9,
            y: 9,
            pixelX: 9 * TILE_SIZE + TILE_SIZE / 2,
            pixelY: 9 * TILE_SIZE + TILE_SIZE / 2,
            color: colors.ghostCyan,
            name: 'Inky',
            direction: 0,
            speed: 2.0,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: true,
            releaseTimer: 1000,
            radius: 8,
            lastTurnX: 9,
            lastTurnY: 9
        },
        {
            x: 10,
            y: 9,
            pixelX: 10 * TILE_SIZE + TILE_SIZE / 2,
            pixelY: 9 * TILE_SIZE + TILE_SIZE / 2,
            color: colors.ghostOrange,
            name: 'Clyde',
            direction: 2,
            speed: 1.8,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: true,
            releaseTimer: 1500,
            radius: 8,
            lastTurnX: 10,
            lastTurnY: 9
        }
    ];
}

// Siguiente nivel
function nextLevel() {
    level++;
    dotsCollected = 0;
    gameRunning = false;
    levelCompleteElement.style.display = 'none';
    
    setupLevel();
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
    // Actualizar animación de Pac-Man
    pacman.animation = (pacman.animation + 1) % 10;
    pacman.mouthOpen = pacman.animation < 5;
    
    // Mover Pac-Man
    movePacman(deltaTime);
    
    // Mover fantasmas
    moveGhosts(deltaTime);
    
    // Verificar colisiones
    checkCollisions();
    
    // Actualizar modo power
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) {
            powerMode = false;
            ghosts.forEach(ghost => {
                if (ghost.mode === 'frightened') {
                    ghost.mode = 'chase';
                    ghost.speed = 2.0;
                }
            });
        }
    }
    
    // Verificar si se completó el nivel
    if (dotsCollected >= totalDots) {
        levelComplete();
    }
    
    updateUI();
}

// Mover Pac-Man - SISTEMA DE COLISIONES SIMPLIFICADO Y EFECTIVO
function movePacman(deltaTime) {
    // Guardar posición anterior
    const oldX = pacman.pixelX;
    const oldY = pacman.pixelY;
    
    // Intentar cambiar dirección si es posible
    if (canMoveInDirection(pacman.nextDirection)) {
        pacman.direction = pacman.nextDirection;
    }
    
    // Mover en la dirección actual
    const moveDistance = pacman.speed * deltaTime;
    
    switch(pacman.direction) {
        case 0: // right
            pacman.pixelX += moveDistance;
            break;
        case 1: // down
            pacman.pixelY += moveDistance;
            break;
        case 2: // left
            pacman.pixelX -= moveDistance;
            break;
        case 3: // up
            pacman.pixelY -= moveDistance;
            break;
    }
    
    // Verificar colisión con paredes - SISTEMA SIMPLIFICADO
    if (isWallCollision(pacman.pixelX, pacman.pixelY)) {
        // Si hay colisión, revertir a la posición anterior
        pacman.pixelX = oldX;
        pacman.pixelY = oldY;
    }
    
    // Actualizar posición en grid
    pacman.x = Math.floor(pacman.pixelX / TILE_SIZE);
    pacman.y = Math.floor(pacman.pixelY / TILE_SIZE);
    
    // Teletransporte entre túneles (solo en los pasillos designados)
    if (pacman.pixelX < -TILE_SIZE && pacman.y === 9) {
        pacman.pixelX = canvas.width + TILE_SIZE;
    } else if (pacman.pixelX > canvas.width + TILE_SIZE && pacman.y === 9) {
        pacman.pixelX = -TILE_SIZE;
    }
    
    // Mantener dentro de los límites verticales
    if (pacman.pixelY < 0) pacman.pixelY = 0;
    if (pacman.pixelY > canvas.height) pacman.pixelY = canvas.height;
    
    // Recolectar puntos, power pellets y frutas
    collectItems();
}

// Verificar colisión con paredes - SISTEMA SIMPLIFICADO Y EFECTIVO
function isWallCollision(x, y) {
    // Calcular las coordenadas del grid para la posición actual
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    
    // Verificar si está fuera de los límites (excepto para túneles)
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        return false; // Permitir teletransporte
    }
    
    // Verificar si la celda actual es una pared
    return maze[gridY][gridX] === 1;
}

// Verificar si puede moverse en una dirección
function canMoveInDirection(direction) {
    const testX = pacman.pixelX;
    const testY = pacman.pixelY;
    
    // Calcular posición futura basada en la dirección
    let futureX = testX;
    let futureY = testY;
    
    switch(direction) {
        case 0: futureX += pacman.radius + 5; break; // right
        case 1: futureY += pacman.radius + 5; break; // down
        case 2: futureX -= pacman.radius + 5; break; // left
        case 3: futureY -= pacman.radius + 5; break; // up
    }
    
    return !isWallCollision(futureX, futureY);
}

// Recolectar items
function collectItems() {
    const gridX = Math.round(pacman.x);
    const gridY = Math.round(pacman.y);
    
    // Recolectar puntos
    for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        if (dot.x === gridX && dot.y === gridY) {
            dots.splice(i, 1);
            score += 10;
            dotsCollected++;
        }
    }
    
    // Recolectar power pellets
    for (let i = powerPellets.length - 1; i >= 0; i--) {
        const pellet = powerPellets[i];
        if (pellet.x === gridX && pellet.y === gridY) {
            powerPellets.splice(i, 1);
            score += 50;
            activatePowerMode();
        }
    }
    
    // Recolectar frutas
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        if (fruit.x === gridX && fruit.y === gridY) {
            fruits.splice(i, 1);
            score += fruit.points;
        }
    }
}

// Mover fantasmas - SISTEMA COMPLETAMENTE REHECHO
function moveGhosts(deltaTime) {
    ghosts.forEach(ghost => {
        // Actualizar timer de liberación
        if (ghost.inHouse && ghost.releaseTimer > 0) {
            ghost.releaseTimer--;
            if (ghost.releaseTimer <= 0) {
                ghost.inHouse = false;
                console.log(`${ghost.name} ha salido!`);
            }
        }
        
        // Solo mover fantasmas que están fuera de casa
        if (!ghost.inHouse) {
            // Guardar posición anterior
            const oldX = ghost.pixelX;
            const oldY = ghost.pixelY;
            
            // Actualizar posición en grid
            ghost.x = Math.floor(ghost.pixelX / TILE_SIZE);
            ghost.y = Math.floor(ghost.pixelY / TILE_SIZE);
            
            // Verificar si está en una nueva celda (para tomar decisiones)
            const newCell = (ghost.x !== ghost.lastTurnX || ghost.y !== ghost.lastTurnY);
            
            if (newCell) {
                ghost.lastTurnX = ghost.x;
                ghost.lastTurnY = ghost.y;
                
                // Actualizar objetivo
                updateGhostTarget(ghost);
                
                // Elegir nueva dirección
                chooseGhostDirection(ghost);
            }
            
            // Mover fantasma
            const moveDistance = ghost.speed * deltaTime;
            
            switch(ghost.direction) {
                case 0: ghost.pixelX += moveDistance; break;
                case 1: ghost.pixelY += moveDistance; break;
                case 2: ghost.pixelX -= moveDistance; break;
                case 3: ghost.pixelY -= moveDistance; break;
            }
            
            // Verificar colisión con paredes para fantasmas
            if (isGhostWallCollision(ghost.pixelX, ghost.pixelY)) {
                // Si hay colisión, revertir a la posición anterior
                ghost.pixelX = oldX;
                ghost.pixelY = oldY;
                
                // Forzar nuevo cálculo de dirección
                ghost.lastTurnX = -1;
                ghost.lastTurnY = -1;
            }
            
            // Teletransporte entre túneles
            if (ghost.pixelX < -TILE_SIZE && ghost.y === 9) {
                ghost.pixelX = canvas.width + TILE_SIZE;
            } else if (ghost.pixelX > canvas.width + TILE_SIZE && ghost.y === 9) {
                ghost.pixelX = -TILE_SIZE;
            }
            
            // Mantener dentro de los límites verticales
            if (ghost.pixelY < 0) ghost.pixelY = 0;
            if (ghost.pixelY > canvas.height) ghost.pixelY = canvas.height;
        }
    });
}

// Verificar colisión con paredes para fantasmas
function isGhostWallCollision(x, y) {
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        return false;
    }
    
    return maze[gridY][gridX] === 1;
}

// Actualizar objetivo del fantasma
function updateGhostTarget(ghost) {
    if (powerMode && ghost.mode !== 'frightened') {
        ghost.mode = 'frightened';
        ghost.speed = 1.5;
    } else if (!powerMode && ghost.mode === 'frightened') {
        ghost.mode = 'chase';
        switch(ghost.name) {
            case 'Blinky': ghost.speed = 2.2; break;
            case 'Pinky': ghost.speed = 2.0; break;
            case 'Inky': ghost.speed = 2.0; break;
            case 'Clyde': ghost.speed = 1.8; break;
        }
    }
    
    // Estrategias de targeting diferentes para cada fantasma
    switch(ghost.name) {
        case 'Blinky': // Persigue directamente a Pac-Man
            ghost.target.x = Math.floor(pacman.x);
            ghost.target.y = Math.floor(pacman.y);
            break;
        case 'Pinky': // Persigue 4 casillas adelante de Pac-Man
            let aheadX = Math.floor(pacman.x);
            let aheadY = Math.floor(pacman.y);
            switch(pacman.direction) {
                case 0: aheadX += 4; break;
                case 1: aheadY += 4; break;
                case 2: aheadX -= 4; break;
                case 3: aheadY -= 4; break;
            }
            ghost.target.x = aheadX;
            ghost.target.y = aheadY;
            break;
        case 'Inky': // Comportamiento aleatorio/intermitente
            if (Math.random() < 0.7) {
                ghost.target.x = Math.floor(pacman.x);
                ghost.target.y = Math.floor(pacman.y);
            } else {
                ghost.target.x = Math.floor(Math.random() * GRID_WIDTH);
                ghost.target.y = Math.floor(Math.random() * GRID_HEIGHT);
            }
            break;
        case 'Clyde': // Huye cuando está cerca
            const distance = Math.sqrt(
                Math.pow(ghost.x - pacman.x, 2) + 
                Math.pow(ghost.y - pacman.y, 2)
            );
            if (distance < 5) {
                ghost.target.x = 1;
                ghost.target.y = GRID_HEIGHT - 2;
            } else {
                ghost.target.x = Math.floor(pacman.x);
                ghost.target.y = Math.floor(pacman.y);
            }
            break;
    }
    
    // En modo asustado, movimiento aleatorio
    if (ghost.mode === 'frightened') {
        ghost.target.x = Math.floor(Math.random() * GRID_WIDTH);
        ghost.target.y = Math.floor(Math.random() * GRID_HEIGHT);
    }
}

// Elegir dirección del fantasma - SISTEMA MEJORADO
function chooseGhostDirection(ghost) {
    const possibleDirections = [];
    const currentX = ghost.x;
    const currentY = ghost.y;
    
    // Probar las 4 direcciones
    for (let dir = 0; dir < 4; dir++) {
        // Evitar dar la vuelta inmediatamente (excepto en modo asustado o si no hay opciones)
        if (ghost.mode !== 'frightened' && dir === (ghost.direction + 2) % 4) {
            continue;
        }
        
        let testX = currentX;
        let testY = currentY;
        
        switch(dir) {
            case 0: testX++; break; // right
            case 1: testY++; break; // down
            case 2: testX--; break; // left
            case 3: testY--; break; // up
        }
        
        // Verificar si el movimiento es válido
        if (testX >= 0 && testX < GRID_WIDTH && testY >= 0 && testY < GRID_HEIGHT) {
            if (maze[testY][testX] === 0) {
                possibleDirections.push(dir);
            }
        }
    }
    
    // Si no hay direcciones posibles, permitir cualquier dirección (incluyendo dar la vuelta)
    if (possibleDirections.length === 0) {
        for (let dir = 0; dir < 4; dir++) {
            let testX = currentX;
            let testY = currentY;
            
            switch(dir) {
                case 0: testX++; break;
                case 1: testY++; break;
                case 2: testX--; break;
                case 3: testY--; break;
            }
            
            if (testX >= 0 && testX < GRID_WIDTH && testY >= 0 && testY < GRID_HEIGHT) {
                if (maze[testY][testX] === 0) {
                    possibleDirections.push(dir);
                }
            }
        }
    }
    
    if (possibleDirections.length === 0) {
        return; // No hay movimientos posibles
    }
    
    let chosenDirection;
    
    if (ghost.mode === 'frightened') {
        // Movimiento aleatorio en modo asustado
        chosenDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    } else {
        // Elegir la dirección que lleve más cerca del objetivo
        let bestDirection = possibleDirections[0];
        let bestDistance = Infinity;
        
        possibleDirections.forEach(dir => {
            let testX = currentX;
            let testY = currentY;
            
            switch(dir) {
                case 0: testX++; break;
                case 1: testY++; break;
                case 2: testX--; break;
                case 3: testY--; break;
            }
            
            // Calcular distancia Manhattan al objetivo
            const distance = Math.abs(testX - ghost.target.x) + Math.abs(testY - ghost.target.y);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = dir;
            }
        });
        
        chosenDirection = bestDirection;
    }
    
    ghost.direction = chosenDirection;
}

// Activar modo power
function activatePowerMode() {
    powerMode = true;
    powerTimer = 420;
    
    ghosts.forEach(ghost => {
        if (!ghost.inHouse) {
            ghost.mode = 'frightened';
            ghost.speed = 1.5;
        }
    });
}

// Verificar colisiones entre Pac-Man y fantasmas
function checkCollisions() {
    ghosts.forEach(ghost => {
        if (ghost.inHouse) return;
        
        const dx = pacman.pixelX - ghost.pixelX;
        const dy = pacman.pixelY - ghost.pixelY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const collisionDistance = pacman.radius + ghost.radius - 2;
        
        if (distance < collisionDistance) {
            if (powerMode && ghost.mode === 'frightened') {
                // Comer fantasma
                score += 200;
                console.log(`¡${ghost.name} comido! +200 puntos`);
                
                // Respawn fantasma
                ghost.pixelX = 9 * TILE_SIZE + TILE_SIZE / 2;
                ghost.pixelY = 9 * TILE_SIZE + TILE_SIZE / 2;
                ghost.inHouse = true;
                ghost.releaseTimer = 300;
                ghost.mode = 'chase';
                switch(ghost.name) {
                    case 'Blinky': ghost.speed = 2.2; break;
                    case 'Pinky': ghost.speed = 2.0; break;
                    case 'Inky': ghost.speed = 2.0; break;
                    case 'Clyde': ghost.speed = 1.8; break;
                }
            } else if (ghost.mode !== 'frightened') {
                // Perder vida
                loseLife();
            }
        }
    });
}

// Perder vida
function loseLife() {
    lives--;
    updateUI();
    console.log(`¡Vida perdida! Vidas restantes: ${lives}`);
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Respawn Pac-Man
        pacman.pixelX = 9 * TILE_SIZE + TILE_SIZE / 2;
        pacman.pixelY = 15 * TILE_SIZE + TILE_SIZE / 2;
        pacman.x = 9;
        pacman.y = 15;
        pacman.direction = 0;
        pacman.nextDirection = 0;
        
        // Respawn fantasmas
        ghosts.forEach(ghost => {
            if (ghost.name === 'Blinky') {
                ghost.pixelX = 9 * TILE_SIZE + TILE_SIZE / 2;
                ghost.pixelY = 8 * TILE_SIZE + TILE_SIZE / 2;
                ghost.inHouse = false;
                ghost.releaseTimer = 0;
            } else {
                ghost.pixelX = (ghost.name === 'Pinky' ? 8 : 
                              ghost.name === 'Inky' ? 9 : 10) * TILE_SIZE + TILE_SIZE / 2;
                ghost.pixelY = 9 * TILE_SIZE + TILE_SIZE / 2;
                ghost.inHouse = true;
                ghost.releaseTimer = ghost.name === 'Pinky' ? 500 : 
                                   ghost.name === 'Inky' ? 1000 : 1500;
            }
            ghost.mode = 'chase';
            switch(ghost.name) {
                case 'Blinky': ghost.speed = 2.2; break;
                case 'Pinky': ghost.speed = 2.0; break;
                case 'Inky': ghost.speed = 2.0; break;
                case 'Clyde': ghost.speed = 1.8; break;
            }
        });
        
        powerMode = false;
        powerTimer = 0;
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
    
    let starsEarned = Math.min(3, Math.floor(level / 2));
    starsEarned = Math.max(1, starsEarned);
    
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    saveProgress(starsEarned);
    
    finalLevelElement.textContent = level;
    finalScoreElement.textContent = score;
    earnedStarsElement.textContent = starsEarned;
    gameOverElement.style.display = 'flex';
}

// Completar nivel
function levelComplete() {
    if (!gameRunning) return;
    
    console.log('Nivel completado!');
    
    gameRunning = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    let starsEarned = Math.min(3, level);
    
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    saveProgress(starsEarned);
    
    nextLevelElement.textContent = level + 1;
    levelCompleteElement.style.display = 'flex';
    
    setTimeout(() => {
        if (levelCompleteElement.style.display === 'flex') {
            nextLevel();
        }
    }, 3000);
}

// Guardar progreso
function saveProgress(starsEarned) {
    try {
        const currentLevel = parseInt(localStorage.getItem('ghost-maze-highscore')) || 0;
        const newLevel = Math.max(currentLevel, level);
        localStorage.setItem('ghost-maze-highscore', newLevel.toString());
        
        const currentStars = parseInt(localStorage.getItem('ghost-maze-stars')) || 0;
        const newStars = currentStars + starsEarned;
        localStorage.setItem('ghost-maze-stars', newStars.toString());
        
        console.log('Progreso guardado:', { level: newLevel, stars: newStars });
    } catch (error) {
        console.error('Error guardando progreso:', error);
    }
}

// Volver al menú
function goToMenu() {
    console.log('Volviendo al menú...');
    
    gameRunning = false;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    try {
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const indexUrl = basePath ? `${basePath}/index.html` : '../index.html';
        
        window.location.href = indexUrl;
    } catch (error) {
        console.error('Error volviendo al menú:', error);
        alert('Juego reiniciado. Para volver al menú principal, cierra esta pestaña.');
        resetGame();
    }
}

// =============================================
// SISTEMA DE DIBUJO
// =============================================

function drawGame() {
    // Fondo
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar laberinto
    drawMaze();
    
    // Dibujar puntos
    drawDots();
    
    // Dibujar power pellets
    drawPowerPellets();
    
    // Dibujar frutas
    drawFruits();
    
    // Dibujar fantasmas
    drawGhosts();
    
    // Dibujar Pac-Man
    drawPacman();
}

function drawMaze() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = colors.wall;
                ctx.fillRect(
                    x * TILE_SIZE, 
                    y * TILE_SIZE, 
                    TILE_SIZE, 
                    TILE_SIZE
                );
                
                ctx.strokeStyle = '#0d24b3';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    x * TILE_SIZE, 
                    y * TILE_SIZE, 
                    TILE_SIZE, 
                    TILE_SIZE
                );
            }
        }
    }
}

function drawDots() {
    ctx.fillStyle = colors.dot;
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(
            dot.x * TILE_SIZE + TILE_SIZE / 2,
            dot.y * TILE_SIZE + TILE_SIZE / 2,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

function drawPowerPellets() {
    ctx.fillStyle = colors.powerPellet;
    powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc(
            pellet.x * TILE_SIZE + TILE_SIZE / 2,
            pellet.y * TILE_SIZE + TILE_SIZE / 2,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

function drawFruits() {
    fruits.forEach(fruit => {
        ctx.fillStyle = colors.fruit;
        ctx.beginPath();
        ctx.arc(
            fruit.x * TILE_SIZE + TILE_SIZE / 2,
            fruit.y * TILE_SIZE + TILE_SIZE / 2,
            5,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fruit.x * TILE_SIZE + TILE_SIZE / 2, fruit.y * TILE_SIZE + TILE_SIZE / 2 - 5);
        ctx.lineTo(fruit.x * TILE_SIZE + TILE_SIZE / 2 - 2, fruit.y * TILE_SIZE + TILE_SIZE / 2 - 8);
        ctx.stroke();
    });
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.inHouse) return; // No dibujar fantasmas que están en casa
        
        const x = ghost.pixelX - TILE_SIZE / 2;
        const y = ghost.pixelY - TILE_SIZE / 2;
        
        ctx.fillStyle = ghost.mode === 'frightened' ? colors.ghostScared : ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.pixelX, ghost.pixelY, TILE_SIZE / 2 - 2, Math.PI, 0, false);
        ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
        ctx.lineTo(x, y + TILE_SIZE);
        ctx.closePath();
        ctx.fill();
        
        const eyeOffset = ghost.mode === 'frightened' ? 0 : 2;
        ctx.fillStyle = colors.ghostEyes;
        ctx.beginPath();
        ctx.arc(ghost.pixelX - 4, ghost.pixelY, 2, 0, Math.PI * 2);
        ctx.arc(ghost.pixelX + 4, ghost.pixelY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        if (ghost.mode !== 'frightened') {
            ctx.fillStyle = '#000';
            let pupilX1 = ghost.pixelX - 4;
            let pupilY1 = ghost.pixelY;
            let pupilX2 = ghost.pixelX + 4;
            let pupilY2 = ghost.pixelY;
            
            switch(ghost.direction) {
                case 0: pupilX1 += eyeOffset; pupilX2 += eyeOffset; break;
                case 1: pupilY1 += eyeOffset; pupilY2 += eyeOffset; break;
                case 2: pupilX1 -= eyeOffset; pupilX2 -= eyeOffset; break;
                case 3: pupilY1 -= eyeOffset; pupilY2 -= eyeOffset; break;
            }
            
            ctx.beginPath();
            ctx.arc(pupilX1, pupilY1, 1, 0, Math.PI * 2);
            ctx.arc(pupilX2, pupilY2, 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ghost.pixelX - 6, ghost.pixelY - 2);
            ctx.lineTo(ghost.pixelX - 2, ghost.pixelY + 2);
            ctx.moveTo(ghost.pixelX + 6, ghost.pixelY - 2);
            ctx.lineTo(ghost.pixelX + 2, ghost.pixelY + 2);
            ctx.stroke();
        }
    });
}

function drawPacman() {
    const centerX = pacman.pixelX;
    const centerY = pacman.pixelY;
    const radius = TILE_SIZE / 2 - 2;
    
    ctx.fillStyle = colors.pacman;
    
    if (pacman.mouthOpen) {
        let startAngle, endAngle;
        
        switch(pacman.direction) {
            case 0: startAngle = 0.2 * Math.PI; endAngle = 1.8 * Math.PI; break;
            case 1: startAngle = 0.7 * Math.PI; endAngle = 2.3 * Math.PI; break;
            case 2: startAngle = 1.2 * Math.PI; endAngle = 2.8 * Math.PI; break;
            case 3: startAngle = 1.7 * Math.PI; endAngle = 3.3 * Math.PI; break;
        }
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#000';
    let eyeX = centerX;
    let eyeY = centerY - 3;
    
    switch(pacman.direction) {
        case 0: eyeX += 2; break;
        case 1: eyeY += 2; break;
        case 2: eyeX -= 2; break;
        case 3: eyeY -= 2; break;
    }
    
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Iniciar cuando se carga la página
window.addEventListener('load', init);

// Prevenir comportamiento por defecto en teclas
window.addEventListener('keydown', function(e) {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
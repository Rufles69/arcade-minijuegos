// ghost-maze.js - Juego Pac-Man estilo (FANTASMAS COMPLETAMENTE CORREGIDOS)

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
    speed: 0.12, // VELOCIDAD REDUCIDA
    animation: 0,
    mouthOpen: true
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
    
    // Crear fantasmas - SISTEMA COMPLETAMENTE NUEVO
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

// Crear fantasmas - SISTEMA SIMPLIFICADO Y CORREGIDO
function createGhosts() {
    ghosts = [
        {
            x: 9,
            y: 8,
            gridX: 9,
            gridY: 8,
            color: colors.ghostRed,
            name: 'Blinky',
            direction: 2,
            speed: 0.08, // VELOCIDAD MUCHO MÁS LENTA
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: false,
            releaseTimer: 0 // Inmediatamente disponible
        },
        {
            x: 8,
            y: 9,
            gridX: 8,
            gridY: 9,
            color: colors.ghostPink,
            name: 'Pinky',
            direction: 0,
            speed: 0.08,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: true,
            releaseTimer: 500 // Sale después de 5 segundos
        },
        {
            x: 9,
            y: 9,
            gridX: 9,
            gridY: 9,
            color: colors.ghostCyan,
            name: 'Inky',
            direction: 0,
            speed: 0.08,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: true,
            releaseTimer: 1000 // Sale después de 10 segundos
        },
        {
            x: 10,
            y: 9,
            gridX: 10,
            gridY: 9,
            color: colors.ghostOrange,
            name: 'Clyde',
            direction: 2,
            speed: 0.08,
            mode: 'chase',
            target: {x: 0, y: 0},
            inHouse: true,
            releaseTimer: 1500 // Sale después de 15 segundos
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

// Iniciar bucle del juego - CON DELTA TIME
function startGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Bucle principal del juego - CON DELTA TIME
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

// Actualizar estado del juego - CON DELTA TIME
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
                    ghost.speed = 0.08;
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

// Mover Pac-Man - CON DELTA TIME
function movePacman(deltaTime) {
    // Intentar cambiar dirección
    if (canMove(pacman.x, pacman.y, pacman.nextDirection)) {
        pacman.direction = pacman.nextDirection;
    }
    
    // Mover en la dirección actual
    if (canMove(pacman.x, pacman.y, pacman.direction)) {
        switch(pacman.direction) {
            case 0: // right
                pacman.x += pacman.speed * deltaTime;
                break;
            case 1: // down
                pacman.y += pacman.speed * deltaTime;
                break;
            case 2: // left
                pacman.x -= pacman.speed * deltaTime;
                break;
            case 3: // up
                pacman.y -= pacman.speed * deltaTime;
                break;
        }
    }
    
    // Teletransporte entre túneles
    if (pacman.x < 0) pacman.x = GRID_WIDTH - 1;
    if (pacman.x >= GRID_WIDTH) pacman.x = 0;
    
    // Actualizar posición en grid
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

// Verificar si puede moverse
function canMove(x, y, direction) {
    let newX = Math.round(x);
    let newY = Math.round(y);
    
    switch(direction) {
        case 0: // right
            newX = Math.floor(x + 0.6);
            break;
        case 1: // down
            newY = Math.floor(y + 0.6);
            break;
        case 2: // left
            newX = Math.ceil(x - 0.6);
            break;
        case 3: // up
            newY = Math.ceil(y - 0.6);
            break;
    }
    
    // Teletransporte entre túneles
    if (newX < 0 || newX >= GRID_WIDTH) {
        return true;
    }
    
    if (newY < 0 || newY >= GRID_HEIGHT) {
        return false;
    }
    
    return maze[newY][newX] === 0;
}

// Mover fantasmas - SISTEMA COMPLETAMENTE NUEVO
function moveGhosts(deltaTime) {
    ghosts.forEach(ghost => {
        // Actualizar timer de liberación
        if (ghost.inHouse && ghost.releaseTimer > 0) {
            ghost.releaseTimer--;
            if (ghost.releaseTimer <= 0) {
                ghost.inHouse = false;
                console.log(`${ghost.name} ha salido de la casa!`);
            }
        }
        
        // Solo mover fantasmas que están fuera de casa
        if (!ghost.inHouse) {
            // Actualizar posición en grid
            ghost.gridX = Math.round(ghost.x);
            ghost.gridY = Math.round(ghost.y);
            
            // Actualizar objetivo
            updateGhostTarget(ghost);
            
            // Elegir dirección solo cuando está en una intersección
            if (isAtIntersection(ghost.gridX, ghost.gridY)) {
                chooseGhostDirection(ghost);
            }
            
            // Mover fantasma
            switch(ghost.direction) {
                case 0: // right
                    ghost.x += ghost.speed * deltaTime;
                    break;
                case 1: // down
                    ghost.y += ghost.speed * deltaTime;
                    break;
                case 2: // left
                    ghost.x -= ghost.speed * deltaTime;
                    break;
                case 3: // up
                    ghost.y -= ghost.speed * deltaTime;
                    break;
            }
            
            // Teletransporte entre túneles
            if (ghost.x < 0) ghost.x = GRID_WIDTH - 1;
            if (ghost.x >= GRID_WIDTH) ghost.x = 0;
        }
    });
}

// Verificar si está en una intersección
function isAtIntersection(x, y) {
    // Un punto es intersección si tiene más de 2 direcciones posibles
    let possibleDirections = 0;
    for (let dir = 0; dir < 4; dir++) {
        if (canMove(x, y, dir)) {
            possibleDirections++;
        }
    }
    return possibleDirections > 2;
}

// Actualizar objetivo del fantasma - SIMPLIFICADO
function updateGhostTarget(ghost) {
    if (powerMode && ghost.mode !== 'frightened') {
        ghost.mode = 'frightened';
        ghost.speed = 0.05; // Más lento cuando está asustado
    } else if (!powerMode && ghost.mode === 'frightened') {
        ghost.mode = 'chase';
        ghost.speed = 0.08;
    }
    
    // Comportamientos simples y efectivos
    switch(ghost.name) {
        case 'Blinky': // Rojo - persigue directamente
            ghost.target.x = Math.round(pacman.x);
            ghost.target.y = Math.round(pacman.y);
            break;
        case 'Pinky': // Rosa - persigue 2 casillas adelante
            let aheadX = Math.round(pacman.x);
            let aheadY = Math.round(pacman.y);
            switch(pacman.direction) {
                case 0: aheadX += 2; break;
                case 1: aheadY += 2; break;
                case 2: aheadX -= 2; break;
                case 3: aheadY -= 2; break;
            }
            ghost.target.x = aheadX;
            ghost.target.y = aheadY;
            break;
        case 'Inky': // Cian - comportamiento aleatorio simple
            if (Math.random() < 0.7) {
                ghost.target.x = Math.round(pacman.x);
                ghost.target.y = Math.round(pacman.y);
            } else {
                ghost.target.x = Math.floor(Math.random() * GRID_WIDTH);
                ghost.target.y = Math.floor(Math.random() * GRID_HEIGHT);
            }
            break;
        case 'Clyde': // Naranja - huye cuando está cerca
            const distance = Math.sqrt(
                Math.pow(ghost.x - pacman.x, 2) + 
                Math.pow(ghost.y - pacman.y, 2)
            );
            if (distance < 4) {
                // Huir a esquina
                ghost.target.x = 1;
                ghost.target.y = GRID_HEIGHT - 2;
            } else {
                // Perseguir
                ghost.target.x = Math.round(pacman.x);
                ghost.target.y = Math.round(pacman.y);
            }
            break;
    }
    
    // En modo asustado, objetivo aleatorio
    if (ghost.mode === 'frightened') {
        ghost.target.x = Math.floor(Math.random() * GRID_WIDTH);
        ghost.target.y = Math.floor(Math.random() * GRID_HEIGHT);
    }
}

// Elegir dirección del fantasma - ALGORITMO SIMPLE Y FUNCIONAL
function chooseGhostDirection(ghost) {
    const possibleDirections = [];
    
    // Obtener direcciones posibles (evitar reversa)
    for (let dir = 0; dir < 4; dir++) {
        // Evitar dar la vuelta inmediatamente (excepto en modo asustado)
        if (ghost.mode !== 'frightened' && dir === (ghost.direction + 2) % 4) {
            continue;
        }
        
        if (canMove(ghost.x, ghost.y, dir)) {
            possibleDirections.push(dir);
        }
    }
    
    if (possibleDirections.length === 0) {
        // Si no hay direcciones, permitir reversa
        for (let dir = 0; dir < 4; dir++) {
            if (canMove(ghost.x, ghost.y, dir)) {
                possibleDirections.push(dir);
            }
        }
    }
    
    if (possibleDirections.length === 0) return;
    
    let chosenDirection;
    
    if (ghost.mode === 'frightened') {
        // Movimiento aleatorio cuando está asustado
        chosenDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    } else {
        // Elegir dirección que lleve más cerca del objetivo
        let bestDirection = possibleDirections[0];
        let bestDistance = Infinity;
        
        possibleDirections.forEach(dir => {
            let testX = ghost.gridX;
            let testY = ghost.gridY;
            
            switch(dir) {
                case 0: testX++; break;
                case 1: testY++; break;
                case 2: testX--; break;
                case 3: testY--; break;
            }
            
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
    powerTimer = 420; // 7 segundos aprox
    
    ghosts.forEach(ghost => {
        if (!ghost.inHouse) {
            ghost.mode = 'frightened';
            ghost.speed = 0.05;
        }
    });
    
    console.log('¡Modo power activado!');
}

// Verificar colisiones - MEJORADO
function checkCollisions() {
    const pacmanX = Math.round(pacman.x);
    const pacmanY = Math.round(pacman.y);
    
    ghosts.forEach(ghost => {
        if (ghost.inHouse) return;
        
        const ghostX = Math.round(ghost.x);
        const ghostY = Math.round(ghost.y);
        
        // Colisión simple (misma celda)
        if (pacmanX === ghostX && pacmanY === ghostY) {
            if (powerMode && ghost.mode === 'frightened') {
                // Comer fantasma
                score += 200;
                console.log(`¡${ghost.name} comido! +200 puntos`);
                
                // Respawn fantasma
                ghost.x = 9;
                ghost.y = 9;
                ghost.inHouse = true;
                ghost.releaseTimer = 300; // 3 segundos para salir
                ghost.mode = 'chase';
                ghost.speed = 0.08;
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
        pacman.x = 9;
        pacman.y = 15;
        pacman.direction = 0;
        pacman.nextDirection = 0;
        
        // Respawn fantasmas
        ghosts.forEach(ghost => {
            if (ghost.name === 'Blinky') {
                ghost.x = 9;
                ghost.y = 8;
                ghost.inHouse = false;
                ghost.releaseTimer = 0;
            } else {
                ghost.x = ghost.name === 'Pinky' ? 8 : 
                         ghost.name === 'Inky' ? 9 : 10;
                ghost.y = 9;
                ghost.inHouse = true;
                ghost.releaseTimer = ghost.name === 'Pinky' ? 500 : 
                                   ghost.name === 'Inky' ? 1000 : 1500;
            }
            ghost.mode = 'chase';
            ghost.speed = 0.08;
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
    
    // Auto-siguiente nivel después de 3 segundos
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
        alert('Juego reiniciado. Para volver al menú principal, cierra esta pestaña.');
        resetGame();
    }
}

// =============================================
// SISTEMA DE DIBUJO (sin cambios mayores)
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
                
                // Borde interior para efecto 3D
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
        
        // Tallo
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
        const x = ghost.x * TILE_SIZE;
        const y = ghost.y * TILE_SIZE;
        
        // Cuerpo del fantasma
        ctx.fillStyle = ghost.mode === 'frightened' ? colors.ghostScared : ghost.color;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, Math.PI, 0, false);
        ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
        ctx.lineTo(x, y + TILE_SIZE);
        ctx.closePath();
        ctx.fill();
        
        // Ojos
        const eyeOffset = ghost.mode === 'frightened' ? 0 : 2;
        ctx.fillStyle = colors.ghostEyes;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2 - 4, y + TILE_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.arc(x + TILE_SIZE / 2 + 4, y + TILE_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilas (dirección)
        if (ghost.mode !== 'frightened') {
            ctx.fillStyle = '#000';
            let pupilX1 = x + TILE_SIZE / 2 - 4;
            let pupilY1 = y + TILE_SIZE / 2;
            let pupilX2 = x + TILE_SIZE / 2 + 4;
            let pupilY2 = y + TILE_SIZE / 2;
            
            switch(ghost.direction) {
                case 0: // right
                    pupilX1 += eyeOffset;
                    pupilX2 += eyeOffset;
                    break;
                case 1: // down
                    pupilY1 += eyeOffset;
                    pupilY2 += eyeOffset;
                    break;
                case 2: // left
                    pupilX1 -= eyeOffset;
                    pupilX2 -= eyeOffset;
                    break;
                case 3: // up
                    pupilY1 -= eyeOffset;
                    pupilY2 -= eyeOffset;
                    break;
            }
            
            ctx.beginPath();
            ctx.arc(pupilX1, pupilY1, 1, 0, Math.PI * 2);
            ctx.arc(pupilX2, pupilY2, 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Ojos asustados
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2 - 6, y + TILE_SIZE / 2 - 2);
            ctx.lineTo(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2 + 2);
            ctx.moveTo(x + TILE_SIZE / 2 + 6, y + TILE_SIZE / 2 - 2);
            ctx.lineTo(x + TILE_SIZE / 2 + 2, y + TILE_SIZE / 2 + 2);
            ctx.stroke();
        }
    });
}

function drawPacman() {
    const x = pacman.x * TILE_SIZE;
    const y = pacman.y * TILE_SIZE;
    const centerX = x + TILE_SIZE / 2;
    const centerY = y + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2 - 2;
    
    ctx.fillStyle = colors.pacman;
    
    if (pacman.mouthOpen) {
        let startAngle, endAngle;
        
        switch(pacman.direction) {
            case 0: // right
                startAngle = 0.2 * Math.PI;
                endAngle = 1.8 * Math.PI;
                break;
            case 1: // down
                startAngle = 0.7 * Math.PI;
                endAngle = 2.3 * Math.PI;
                break;
            case 2: // left
                startAngle = 1.2 * Math.PI;
                endAngle = 2.8 * Math.PI;
                break;
            case 3: // up
                startAngle = 1.7 * Math.PI;
                endAngle = 3.3 * Math.PI;
                break;
        }
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
    } else {
        // Boca cerrada
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ojo de Pac-Man
    ctx.fillStyle = '#000';
    let eyeX = centerX;
    let eyeY = centerY - 3;
    
    switch(pacman.direction) {
        case 0: eyeX += 2; break; // right
        case 1: eyeY += 2; break; // down
        case 2: eyeX -= 2; break; // left
        case 3: eyeY -= 2; break; // up
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
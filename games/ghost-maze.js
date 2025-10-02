// ghost-maze-complete.js - Juego Laberinto Fantasma COMPLETO

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelElement = document.getElementById('level');
const timeElement = document.getElementById('time');
const keysElement = document.getElementById('keys');
const ghostsElement = document.getElementById('ghosts');
const progressFill = document.getElementById('progressFill');
const gameOverElement = document.getElementById('gameOver');
const levelCompleteElement = document.getElementById('levelComplete');
const pausedScreen = document.getElementById('pausedScreen');
const finalLevelElement = document.getElementById('finalLevel');
const finalKeysElement = document.getElementById('finalKeys');
const startBtn = document.getElementById('startBtn');
const menuBtn = document.getElementById('menuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const resumeBtn = document.getElementById('resumeBtn');
const mobileBtns = document.querySelectorAll('.mobile-btn');
const stars = document.querySelectorAll('.star');

// Configuración del juego COMPLETA
const game = {
    running: false,
    paused: false,
    level: 1,
    timeLeft: 120,
    totalTime: 120,
    keysCollected: 0,
    keysRequired: 3,
    doorsOpened: 0,
    highscore: 0,
    gameLoopId: null,
    lastTime: 0,
    maze: [],
    player: null,
    ghosts: [],
    keys: [],
    doors: [],
    powerUps: [],
    exit: null,
    message: '',
    messageTimer: 0,
    showExit: true,
    exitLocked: true,
    particles: [],
    animations: [],
    ghostKillMode: false,
    ghostKillTimer: 0,
    ghostKillDuration: 5,
    killCooldown: 10,
    lastKillTime: 0
};

// Tamaño de las celdas del laberinto
const CELL_SIZE = 35;
const MAZE_WIDTH = 21;
const MAZE_HEIGHT = 21;

// Ajustar tamaño del canvas
canvas.width = MAZE_WIDTH * CELL_SIZE;
canvas.height = MAZE_HEIGHT * CELL_SIZE;

// Colores COMPLETOS
const COLORS = {
    wall: '#2c3e50',
    path: '#34495e',
    pathGradient1: '#2c3e50',
    pathGradient2: '#34495e',
    player: '#e74c3c',
    playerGlow: '#ff7979',
    ghost: '#9b59b6',
    ghostGlow: '#8e44ad',
    ghostEyes: '#ecf0f1',
    ghostDead: '#95a5a6',
    key: '#f1c40f',
    keyGlow: '#f39c12',
    door: '#e67e22',
    doorOpen: '#27ae60',
    doorLocked: '#c0392b',
    exit: '#2ecc71',
    exitLocked: '#e74c3c',
    text: '#ecf0f1',
    progressBg: '#2c3e50',
    progressFill: '#3498db',
    particle: '#3498db',
    powerUp: '#e74c3c',
    powerUpGlow: '#ff7979'
};

// Configuración de niveles COMPLETA
const levelConfig = {
    1: { 
        time: 150, 
        ghosts: 2, 
        keys: 5, 
        doors: 3, 
        ghostSpeed: 0.8, 
        ghostVision: 5,
        keyDistribution: {easy: 3, medium: 2, hard: 0},
        doorDifficulty: {easy: 2, medium: 1, hard: 0},
        powerUps: 1
    },
    2: { 
        time: 140, 
        ghosts: 3, 
        keys: 6, 
        doors: 4, 
        ghostSpeed: 1.0, 
        ghostVision: 6,
        keyDistribution: {easy: 2, medium: 3, hard: 1},
        doorDifficulty: {easy: 1, medium: 2, hard: 1},
        powerUps: 1
    },
    3: { 
        time: 130, 
        ghosts: 4, 
        keys: 7, 
        doors: 5, 
        ghostSpeed: 1.2, 
        ghostVision: 7,
        keyDistribution: {easy: 1, medium: 3, hard: 3},
        doorDifficulty: {easy: 0, medium: 3, hard: 2},
        powerUps: 2
    },
    4: { 
        time: 120, 
        ghosts: 5, 
        keys: 8, 
        doors: 6, 
        ghostSpeed: 1.4, 
        ghostVision: 8,
        keyDistribution: {easy: 1, medium: 3, hard: 4},
        doorDifficulty: {easy: 0, medium: 2, hard: 4},
        powerUps: 2
    },
    5: { 
        time: 110, 
        ghosts: 6, 
        keys: 9, 
        doors: 7, 
        ghostSpeed: 1.6, 
        ghostVision: 9,
        keyDistribution: {easy: 0, medium: 4, hard: 5},
        doorDifficulty: {easy: 0, medium: 1, hard: 6},
        powerUps: 3
    }
};

// Inicializar el juego
function init() {
    console.log('Inicializando Laberinto Fantasma COMPLETO...');
    
    // Configurar event listeners
    document.addEventListener('keydown', handleKeyDown);
    if (startBtn) startBtn.addEventListener('click', startGame);
    if (menuBtn) menuBtn.addEventListener('click', goToMenu);
    if (playAgainBtn) playAgainBtn.addEventListener('click', resetGame);
    if (nextLevelBtn) nextLevelBtn.addEventListener('click', nextLevel);
    if (resumeBtn) resumeBtn.addEventListener('click', togglePause);
    
    // Controles móviles
    setupMobileControls();
    
    // Prevenir scroll con teclas de flecha
    window.addEventListener('keydown', function(e) {
        if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
    
    // Dibujar pantalla inicial
    drawInitialScreen();
    
    console.log('Juego inicializado correctamente');
}

// Dibujar pantalla inicial MEJORADA
function drawInitialScreen() {
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título con efecto de brillo
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(231, 76, 60, 0.7)';
    ctx.shadowBlur = 15;
    ctx.fillText('LABERINTO FANTASMA', canvas.width/2, canvas.height/2 - 50);
    ctx.shadowBlur = 0;
    
    // Instrucciones
    ctx.font = '16px Arial';
    ctx.fillText('Presiona INICIAR JUEGO', canvas.width/2, canvas.height/2);
    ctx.fillText('Usa las flechas para moverte', canvas.width/2, canvas.height/2 + 25);
    ctx.fillText('Presiona E para abrir puertas', canvas.width/2, canvas.height/2 + 50);
    ctx.fillText('Espacio para pausar', canvas.width/2, canvas.height/2 + 75);
    ctx.fillText('¡Recoge los power-ups ⚡ para matar fantasmas!', canvas.width/2, canvas.height/2 + 110);
    
    // Dibujar un pequeño laberinto decorativo
    drawDecorativeMaze();
    
    ctx.textAlign = 'left';
}

// Dibujar laberinto decorativo en la pantalla inicial
function drawDecorativeMaze() {
    const size = 7;
    const cellSize = 15;
    const startX = (canvas.width - size * cellSize) / 2;
    const startY = canvas.height/2 + 120;
    
    // Patrón de laberinto simple
    const pattern = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,0,0,0,1],
        [1,0,1,0,1,1,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1]
    ];
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (pattern[y][x] === 1) {
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(startX + x * cellSize, startY + y * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Jugador decorativo
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(startX + cellSize + 3, startY + cellSize + 3, cellSize - 6, cellSize - 6);
    
    // Salida decorativa
    ctx.fillStyle = COLORS.exit;
    ctx.fillRect(startX + (size-2) * cellSize + 3, startY + (size-2) * cellSize + 3, cellSize - 6, cellSize - 6);
    
    // Power-up decorativo
    ctx.fillStyle = COLORS.powerUp;
    ctx.fillRect(startX + 3 * cellSize + 3, startY + 3 * cellSize + 3, cellSize - 6, cellSize - 6);
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', startX + 3 * cellSize + cellSize/2, startY + 3 * cellSize + cellSize/2);
}

// Configurar controles móviles
function setupMobileControls() {
    mobileBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.getAttribute('data-direction');
            handleMobileInput(direction);
        });
        
        // Efecto visual al presionar
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.9)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Manejar entrada móvil
function handleMobileInput(direction) {
    if (!game.running) {
        startGame();
        return;
    }
    
    if (game.paused) return;
    
    switch(direction) {
        case 'up':
            movePlayer(0, -1);
            break;
        case 'down':
            movePlayer(0, 1);
            break;
        case 'left':
            movePlayer(-1, 0);
            break;
        case 'right':
            movePlayer(1, 0);
            break;
        case 'action':
            tryOpenDoor();
            break;
    }
}

// Intentar abrir una puerta
function tryOpenDoor() {
    const directions = [
        {dx: 0, dy: -1}, {dx: 1, dy: 0}, 
        {dx: 0, dy: 1}, {dx: -1, dy: 0}
    ];
    
    for (const dir of directions) {
        const checkX = game.player.x + dir.dx;
        const checkY = game.player.y + dir.dy;
        
        // Verificar si hay una puerta
        const door = game.doors.find(d => d.x === checkX && d.y === checkY && !d.opened);
        if (door) {
            if (game.keysCollected >= door.requiredKeys) {
                door.opened = true;
                game.doorsOpened++;
                game.message = `¡Puerta abierta! Usadas ${door.requiredKeys} llaves`;
                game.messageTimer = 3;
                
                // Efecto visual al abrir puerta
                createParticleEffect(door.x, door.y, 12, COLORS.doorOpen);
                
                updateUI();
                return;
            } else {
                const needed = door.requiredKeys - game.keysCollected;
                game.message = `Necesitas ${needed} llave${needed !== 1 ? 's' : ''} más`;
                game.messageTimer = 2;
                return;
            }
        }
    }
    
    // Si no hay puertas, intentar abrir la salida
    tryOpenExit();
}

// Intentar abrir la salida
function tryOpenExit() {
    const directions = [
        {dx: 0, dy: -1}, {dx: 1, dy: 0}, 
        {dx: 0, dy: 1}, {dx: -1, dy: 0}
    ];
    
    for (const dir of directions) {
        const checkX = game.player.x + dir.dx;
        const checkY = game.player.y + dir.dy;
        
        if (checkX === game.exit.x && checkY === game.exit.y) {
            if (game.keysCollected >= game.keysRequired) {
                game.exitLocked = false;
                game.message = '¡Salida desbloqueada! Ve hacia la puerta.';
                game.messageTimer = 3;
                
                // Efecto visual al desbloquear salida
                createParticleEffect(game.exit.x, game.exit.y, 15, COLORS.exit);
                
                updateUI();
            } else {
                const needed = game.keysRequired - game.keysCollected;
                game.message = `Necesitas ${needed} llave${needed !== 1 ? 's' : ''} más para la salida`;
                game.messageTimer = 2;
            }
            break;
        }
    }
}

// Crear efecto de partículas
function createParticleEffect(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        game.particles.push({
            x: x * CELL_SIZE + CELL_SIZE/2,
            y: y * CELL_SIZE + CELL_SIZE/2,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            color: color,
            life: 1.0,
            decay: Math.random() * 0.05 + 0.02
        });
    }
}

// Actualizar partículas
function updateParticles(deltaTime) {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= p.decay * deltaTime * 60;
        
        if (p.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

// Dibujar partículas
function drawParticles() {
    game.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;
}

// Manejar teclas presionadas
function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (e.key === ' ' && game.running) {
        togglePause();
        return;
    }
    
    if (e.key === 'e' && game.running && !game.paused) {
        tryOpenDoor();
        return;
    }
    
    if (!game.running && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        startGame();
    }
    
    if (!game.running || game.paused) return;
    
    switch(e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
}

// Mover jugador
function movePlayer(dx, dy) {
    if (!game.running || game.paused) return;
    
    const newX = game.player.x + dx;
    const newY = game.player.y + dy;
    
    if (isValidPosition(newX, newY)) {
        game.player.x = newX;
        game.player.y = newY;
        checkCollisions();
        drawGame();
    }
}

// Verificar si la posición es válida
function isValidPosition(x, y) {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return false;
    
    // Verificar si es pared
    if (game.maze[y][x] === 1) {
        // Verificar si hay puertas abiertas
        const door = game.doors.find(d => d.x === x && d.y === y && d.opened);
        return door !== undefined;
    }
    
    // Verificar si es salida bloqueada
    if (x === game.exit.x && y === game.exit.y && game.exitLocked) {
        return false;
    }
    
    // Verificar si es puerta cerrada
    const closedDoor = game.doors.find(d => d.x === x && d.y === y && !d.opened);
    if (closedDoor) {
        return false;
    }
    
    return true;
}

// Pausar/Reanudar juego
function togglePause() {
    if (!game.running) return;
    
    game.paused = !game.paused;
    
    if (game.paused) {
        if (pausedScreen) pausedScreen.style.display = 'block';
        if (startBtn) startBtn.textContent = 'REANUDAR';
    } else {
        if (pausedScreen) pausedScreen.style.display = 'none';
        if (startBtn) startBtn.textContent = 'REINICIAR';
        game.lastTime = Date.now();
        gameLoop();
    }
}

// Iniciar juego
function startGame() {
    if (game.running && !game.paused) {
        resetGame();
        return;
    }
    
    if (game.paused) {
        togglePause();
        return;
    }
    
    game.running = true;
    game.paused = false;
    if (startBtn) startBtn.textContent = 'REINICIAR';
    if (pausedScreen) pausedScreen.style.display = 'none';
    game.lastTime = Date.now();
    
    if (game.gameLoopId) {
        cancelAnimationFrame(game.gameLoopId);
    }
    
    if (game.maze.length === 0) {
        generateMaze();
    }
    
    gameLoop();
}

// Reiniciar juego
function resetGame() {
    game.running = false;
    game.paused = false;
    game.level = 1;
    const config = levelConfig[game.level];
    game.timeLeft = config.time;
    game.totalTime = config.time;
    game.keysCollected = 0;
    game.keysRequired = 3;
    game.doorsOpened = 0;
    game.ghosts = [];
    game.keys = [];
    game.doors = [];
    game.powerUps = [];
    game.ghostKillMode = false;
    game.ghostKillTimer = 0;
    game.message = '';
    game.messageTimer = 0;
    game.showExit = true;
    game.exitLocked = true;
    game.particles = [];
    
    generateMaze();
    updateUI();
    
    if (gameOverElement) gameOverElement.style.display = 'none';
    if (levelCompleteElement) levelCompleteElement.style.display = 'none';
    if (pausedScreen) pausedScreen.style.display = 'none';
    if (startBtn) startBtn.textContent = 'INICIAR JUEGO';
    
    if (stars) {
        stars.forEach(star => star.classList.remove('active'));
    }
    
    drawGame();
}

// Actualizar UI
function updateUI() {
    if (levelElement) levelElement.textContent = game.level;
    if (timeElement) timeElement.textContent = Math.ceil(game.timeLeft);
    if (keysElement) keysElement.textContent = game.keysCollected + '/' + game.keysRequired;
    if (ghostsElement) ghostsElement.textContent = game.ghosts.length;
    
    const progress = ((game.totalTime - game.timeLeft) / game.totalTime) * 100;
    if (progressFill) progressFill.style.width = Math.min(100, progress) + '%';
}

// Siguiente nivel
function nextLevel() {
    game.level++;
    const config = levelConfig[game.level] || levelConfig[1];
    game.timeLeft = config.time;
    game.totalTime = config.time;
    game.keysCollected = 0;
    game.keysRequired = 3 + Math.floor(game.level / 2);
    game.doorsOpened = 0;
    game.ghosts = [];
    game.keys = [];
    game.doors = [];
    game.powerUps = [];
    game.ghostKillMode = false;
    game.ghostKillTimer = 0;
    game.message = '';
    game.messageTimer = 0;
    game.showExit = true;
    game.exitLocked = true;
    game.particles = [];
    
    generateMaze();
    updateUI();
    if (levelCompleteElement) levelCompleteElement.style.display = 'none';
    
    game.running = true;
    game.paused = false;
    game.lastTime = Date.now();
    gameLoop();
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para contar vecinos caminables
function countNeighbors(x, y) {
    let count = 0;
    const neighbors = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0},
        {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ];
    
    for (const neighbor of neighbors) {
        const newX = x + neighbor.dx;
        const newY = y + neighbor.dy;
        
        if (newX >= 0 && newX < MAZE_WIDTH && 
            newY >= 0 && newY < MAZE_HEIGHT &&
            game.maze[newY][newX] === 0) {
            count++;
        }
    }
    
    return count;
}

// Función para verificar si hay un camino entre dos puntos
function isReachable(startX, startY, endX, endY) {
    // Crear una copia del laberinto para marcar celdas visitadas
    const visited = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        visited[y] = [];
        for (let x = 0; x < MAZE_WIDTH; x++) {
            visited[y][x] = false;
        }
    }
    
    // BFS para verificar conectividad
    const queue = [{x: startX, y: startY}];
    visited[startY][startX] = true;
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Si llegamos al destino
        if (current.x === endX && current.y === endY) {
            return true;
        }
        
        // Explorar vecinos
        const neighbors = [
            {dx: 1, dy: 0}, {dx: -1, dy: 0},
            {dx: 0, dy: 1}, {dx: 0, dy: -1}
        ];
        
        for (const neighbor of neighbors) {
            const newX = current.x + neighbor.dx;
            const newY = current.y + neighbor.dy;
            
            if (newX >= 0 && newX < MAZE_WIDTH && 
                newY >= 0 && newY < MAZE_HEIGHT &&
                !visited[newY][newX] && 
                game.maze[newY][newX] === 0) {
                
                visited[newY][newX] = true;
                queue.push({x: newX, y: newY});
            }
        }
    }
    
    return false;
}

// Algoritmo DFS para generar laberinto
function generateMazeDFS(x, y) {
    // Direcciones: derecha, abajo, izquierda, arriba
    const directions = [
        {dx: 2, dy: 0},
        {dx: 0, dy: 2},
        {dx: -2, dy: 0},
        {dx: 0, dy: -2}
    ];
    
    // Mezclar direcciones
    shuffleArray(directions);
    
    // Marcar la celda actual como camino
    game.maze[y][x] = 0;
    
    // Explorar en todas las direcciones
    for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;
        
        // Verificar si la nueva posición está dentro de los límites
        if (newX > 0 && newX < MAZE_WIDTH - 1 && newY > 0 && newY < MAZE_HEIGHT - 1) {
            // Si la celda objetivo es una pared, crear un camino
            if (game.maze[newY][newX] === 1) {
                // Quitar la pared entre la celda actual y la nueva
                game.maze[y + dir.dy / 2][x + dir.dx / 2] = 0;
                
                // Llamar recursivamente para la nueva celda
                generateMazeDFS(newX, newY);
            }
        }
    }
}

// Crear caminos adicionales para hacer el laberinto más interesante
function createAdditionalPaths() {
    const additionalPaths = Math.floor((MAZE_WIDTH * MAZE_HEIGHT) / 100);
    
    for (let i = 0; i < additionalPaths; i++) {
        const x = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1;
        const y = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1;
        
        if (game.maze[y][x] === 1 && countNeighbors(x, y) >= 2) {
            game.maze[y][x] = 0;
        }
    }
}

// Colocar puertas MEJORADO - ESTRATÉGICO Y BALANCEADO
function placeDoors() {
    const config = levelConfig[game.level] || levelConfig[1];
    game.doors = [];
    
    // Calcular rutas principales entre jugador y salida
    const mainPaths = findMainPaths();
    
    // Posiciones candidatas para puertas - priorizando rutas principales
    const candidatePositions = [];
    
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            // Solo considerar celdas que son caminos y no están ocupadas
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.keys.some(key => key.x === x && key.y === y)) {
                
                // Puntuación basada en importancia estratégica
                let score = 0;
                
                // +3 puntos si está en una ruta principal
                if (mainPaths.some(path => path.x === x && path.y === y)) {
                    score += 3;
                }
                
                // +2 puntos si conecta áreas importantes
                if (isChokepoint(x, y)) {
                    score += 2;
                }
                
                // +1 punto si tiene múltiples direcciones (no es callejón sin salida)
                if (countNeighbors(x, y) >= 2) {
                    score += 1;
                }
                
                // -2 puntos si está demasiado cerca del jugador (primeras puertas fáciles)
                const distanceToPlayer = Math.abs(x - game.player.x) + Math.abs(y - game.player.y);
                if (distanceToPlayer < 4) {
                    score -= 2;
                }
                
                // -1 punto si está demasiado cerca de la salida
                const distanceToExit = Math.abs(x - game.exit.x) + Math.abs(y - game.exit.y);
                if (distanceToExit < 4) {
                    score -= 1;
                }
                
                if (score > 0) {
                    candidatePositions.push({x, y, score, distanceToPlayer, distanceToExit});
                }
            }
        }
    }
    
    // Ordenar por puntuación (mejores posiciones primero)
    candidatePositions.sort((a, b) => b.score - a.score);
    
    // Distribuir puertas por dificultad
    const doorCount = Math.min(config.doors, candidatePositions.length);
    const easyDoors = config.doorDifficulty.easy;
    const mediumDoors = config.doorDifficulty.medium;
    const hardDoors = config.doorDifficulty.hard;
    
    let placedDoors = 0;
    
    // Puertas FÁCILES (cerca del jugador, pocas llaves requeridas)
    for (let i = 0; i < easyDoors && placedDoors < doorCount && candidatePositions.length > 0; i++) {
        // Buscar posiciones cercanas al jugador pero no demasiado
        const easyCandidate = candidatePositions.find(pos => pos.distanceToPlayer >= 3 && pos.distanceToPlayer <= 6);
        if (easyCandidate) {
            const index = candidatePositions.indexOf(easyCandidate);
            const pos = candidatePositions.splice(index, 1)[0];
            
            game.doors.push({
                x: pos.x,
                y: pos.y,
                requiredKeys: 1,
                opened: false,
                difficulty: 'easy'
            });
            placedDoors++;
        }
    }
    
    // Puertas MEDIAS (distancia media, llaves moderadas)
    for (let i = 0; i < mediumDoors && placedDoors < doorCount && candidatePositions.length > 0; i++) {
        const mediumCandidate = candidatePositions.find(pos => pos.distanceToPlayer >= 5 && pos.distanceToPlayer <= 10);
        if (mediumCandidate) {
            const index = candidatePositions.indexOf(mediumCandidate);
            const pos = candidatePositions.splice(index, 1)[0];
            
            game.doors.push({
                x: pos.x,
                y: pos.y,
                requiredKeys: 2,
                opened: false,
                difficulty: 'medium'
            });
            placedDoors++;
        }
    }
    
    // Puertas DIFÍCILES (lejos del jugador o cerca de salida, muchas llaves)
    for (let i = 0; i < hardDoors && placedDoors < doorCount && candidatePositions.length > 0; i++) {
        const hardCandidate = candidatePositions.find(pos => 
            pos.distanceToPlayer >= 8 || pos.distanceToExit <= 5
        );
        if (hardCandidate) {
            const index = candidatePositions.indexOf(hardCandidate);
            const pos = candidatePositions.splice(index, 1)[0];
            
            game.doors.push({
                x: pos.x,
                y: pos.y,
                requiredKeys: 3,
                opened: false,
                difficulty: 'hard'
            });
            placedDoors++;
        }
    }
    
    // Si aún quedan puertas por colocar, usar las mejores posiciones restantes
    while (placedDoors < doorCount && candidatePositions.length > 0) {
        const pos = candidatePositions.shift();
        const requiredKeys = placedDoors < 2 ? 1 : (placedDoors < 4 ? 2 : 3);
        
        game.doors.push({
            x: pos.x,
            y: pos.y,
            requiredKeys: requiredKeys,
            opened: false,
            difficulty: requiredKeys === 1 ? 'easy' : (requiredKeys === 2 ? 'medium' : 'hard')
        });
        placedDoors++;
    }
    
    console.log(`Puertas colocadas: ${game.doors.length} (Fácil: ${game.doors.filter(d => d.difficulty === 'easy').length}, Media: ${game.doors.filter(d => d.difficulty === 'medium').length}, Difícil: ${game.doors.filter(d => d.difficulty === 'hard').length})`);
}

// Colocar llaves MEJORADO - DISTRIBUCIÓN ESTRATÉGICA
function placeKeys() {
    const config = levelConfig[game.level] || levelConfig[1];
    game.keys = [];
    
    // Encontrar áreas del laberinto clasificadas por dificultad
    const areaAnalysis = analyzeMazeAreas();
    
    // Posiciones candidatas para llaves
    const candidatePositions = [];
    
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.doors.some(door => door.x === x && door.y === y)) {
                
                // Determinar dificultad del área
                const areaDifficulty = getAreaDifficulty(x, y, areaAnalysis);
                const distanceToPlayer = Math.abs(x - game.player.x) + Math.abs(y - game.player.y);
                const distanceToExit = Math.abs(x - game.exit.x) + Math.abs(y - game.exit.y);
                
                candidatePositions.push({
                    x, y, 
                    difficulty: areaDifficulty,
                    distanceToPlayer,
                    distanceToExit,
                    isDeadEnd: countNeighbors(x, y) === 1,
                    isCrossroad: countNeighbors(x, y) >= 3
                });
            }
        }
    }
    
    // Distribuir llaves por dificultad
    const totalKeys = Math.min(config.keys, candidatePositions.length);
    const easyKeys = config.keyDistribution.easy;
    const mediumKeys = config.keyDistribution.medium;
    const hardKeys = config.keyDistribution.hard;
    
    let placedKeys = 0;
    
    // LLAVES FÁCILES (cerca del jugador, en áreas seguras)
    const easyCandidates = candidatePositions.filter(pos => 
        pos.difficulty === 'easy' && 
        pos.distanceToPlayer >= 2 && 
        pos.distanceToPlayer <= 6 &&
        !pos.isDeadEnd
    );
    
    shuffleArray(easyCandidates);
    for (let i = 0; i < easyKeys && placedKeys < totalKeys && easyCandidates.length > 0; i++) {
        const pos = easyCandidates.pop();
        candidatePositions.splice(candidatePositions.indexOf(pos), 1);
        
        game.keys.push({
            x: pos.x,
            y: pos.y,
            collected: false,
            difficulty: 'easy'
        });
        placedKeys++;
    }
    
    // LLAVES MEDIAS (distancia media,可能需要 explorar)
    const mediumCandidates = candidatePositions.filter(pos => 
        pos.difficulty === 'medium' && 
        pos.distanceToPlayer >= 4 && 
        pos.distanceToPlayer <= 12
    );
    
    shuffleArray(mediumCandidates);
    for (let i = 0; i < mediumKeys && placedKeys < totalKeys && mediumCandidates.length > 0; i++) {
        const pos = mediumCandidates.pop();
        candidatePositions.splice(candidatePositions.indexOf(pos), 1);
        
        game.keys.push({
            x: pos.x,
            y: pos.y,
            collected: false,
            difficulty: 'medium'
        });
        placedKeys++;
    }
    
    // LLAVES DIFÍCILES (lejos del jugador, en áreas peligrosas o callejones)
    const hardCandidates = candidatePositions.filter(pos => 
        (pos.difficulty === 'hard' || pos.isDeadEnd) && 
        pos.distanceToPlayer >= 8
    );
    
    shuffleArray(hardCandidates);
    for (let i = 0; i < hardKeys && placedKeys < totalKeys && hardCandidates.length > 0; i++) {
        const pos = hardCandidates.pop();
        candidatePositions.splice(candidatePositions.indexOf(pos), 1);
        
        game.keys.push({
            x: pos.x,
            y: pos.y,
            collected: false,
            difficulty: 'hard'
        });
        placedKeys++;
    }
    
    // Si necesitamos más llaves, completar con cualquier posición disponible
    while (placedKeys < totalKeys && candidatePositions.length > 0) {
        // Priorizar posiciones en intersecciones
        const crossroad = candidatePositions.find(pos => pos.isCrossroad);
        const pos = crossroad || candidatePositions[0];
        candidatePositions.splice(candidatePositions.indexOf(pos), 1);
        
        const difficulty = pos.distanceToPlayer < 6 ? 'easy' : 
                          pos.distanceToPlayer < 12 ? 'medium' : 'hard';
        
        game.keys.push({
            x: pos.x,
            y: pos.y,
            collected: false,
            difficulty: difficulty
        });
        placedKeys++;
    }
    
    console.log(`Llaves colocadas: ${game.keys.length} (Fácil: ${game.keys.filter(k => k.difficulty === 'easy').length}, Media: ${game.keys.filter(k => k.difficulty === 'medium').length}, Difícil: ${game.keys.filter(k => k.difficulty === 'hard').length})`);
}

// FUNCIONES AUXILIARES MEJORADAS

// Encontrar rutas principales entre jugador y salida
function findMainPaths() {
    const paths = [];
    const visited = Array(MAZE_HEIGHT).fill().map(() => Array(MAZE_WIDTH).fill(false));
    
    function bfs(startX, startY, endX, endY) {
        const queue = [{x: startX, y: startY, path: []}];
        visited[startY][startX] = true;
        
        while (queue.length > 0) {
            const current = queue.shift();
            const newPath = [...current.path, {x: current.x, y: current.y}];
            
            if (current.x === endX && current.y === endY) {
                return newPath;
            }
            
            const neighbors = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0},
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ];
            
            for (const neighbor of neighbors) {
                const newX = current.x + neighbor.dx;
                const newY = current.y + neighbor.dy;
                
                if (newX >= 0 && newX < MAZE_WIDTH && 
                    newY >= 0 && newY < MAZE_HEIGHT &&
                    !visited[newY][newX] && 
                    game.maze[newY][newX] === 0) {
                    
                    visited[newY][newX] = true;
                    queue.push({x: newX, y: newY, path: newPath});
                }
            }
        }
        return [];
    }
    
    // Encontrar 3 rutas diferentes
    for (let i = 0; i < 3; i++) {
        const path = bfs(game.player.x, game.player.y, game.exit.x, game.exit.y);
        paths.push(...path);
        
        // Marcar celdas visitadas para encontrar rutas alternativas
        path.forEach(cell => {
            visited[cell.y][cell.x] = true;
        });
    }
    
    return paths;
}

// Analizar áreas del laberinto por dificultad
function analyzeMazeAreas() {
    const areas = {
        easy: [],
        medium: [],
        hard: []
    };
    
    // Mapa de distancia desde el jugador
    const distanceMap = createDistanceMap(game.player.x, game.player.y);
    
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            if (game.maze[y][x] === 0) {
                const distance = distanceMap[y][x];
                const neighbors = countNeighbors(x, y);
                const isNearGhost = game.ghosts.some(ghost => 
                    Math.abs(ghost.x - x) + Math.abs(ghost.y - y) <= 3
                );
                const isNearExit = Math.abs(game.exit.x - x) + Math.abs(game.exit.y - y) <= 4;
                
                let difficulty = 'medium';
                
                if (distance <= 5 && !isNearGhost && neighbors >= 2) {
                    difficulty = 'easy';
                } else if (distance >= 10 || isNearGhost || isNearExit || neighbors === 1) {
                    difficulty = 'hard';
                }
                
                areas[difficulty].push({x, y});
            }
        }
    }
    
    return areas;
}

// Crear mapa de distancias desde un punto
function createDistanceMap(startX, startY) {
    const distanceMap = Array(MAZE_HEIGHT).fill().map(() => Array(MAZE_WIDTH).fill(999));
    const queue = [{x: startX, y: startY, distance: 0}];
    distanceMap[startY][startX] = 0;
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        const neighbors = [
            {dx: 1, dy: 0}, {dx: -1, dy: 0},
            {dx: 0, dy: 1}, {dx: 0, dy: -1}
        ];
        
        for (const neighbor of neighbors) {
            const newX = current.x + neighbor.dx;
            const newY = current.y + neighbor.dy;
            const newDistance = current.distance + 1;
            
            if (newX >= 0 && newX < MAZE_WIDTH && 
                newY >= 0 && newY < MAZE_HEIGHT &&
                game.maze[newY][newX] === 0 &&
                newDistance < distanceMap[newY][newX]) {
                
                distanceMap[newY][newX] = newDistance;
                queue.push({x: newX, y: newY, distance: newDistance});
            }
        }
    }
    
    return distanceMap;
}

// Determinar dificultad de un área específica
function getAreaDifficulty(x, y, areaAnalysis) {
    if (areaAnalysis.easy.some(area => area.x === x && area.y === y)) return 'easy';
    if (areaAnalysis.hard.some(area => area.x === x && area.y === y)) return 'hard';
    return 'medium';
}

// Verificar si una posición es un cuello de botella
function isChokepoint(x, y) {
    if (game.maze[y][x] !== 0) return false;
    
    const directions = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0},
        {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ];
    
    // Contar caminos en cada dirección
    let accessiblePaths = 0;
    let hasSeparation = false;
    
    for (let i = 0; i < directions.length; i++) {
        const dir1 = directions[i];
        const nx1 = x + dir1.dx;
        const ny1 = y + dir1.dy;
        
        if (nx1 >= 0 && nx1 < MAZE_WIDTH && ny1 >= 0 && ny1 < MAZE_HEIGHT && 
            game.maze[ny1][nx1] === 0) {
            accessiblePaths++;
            
            // Verificar si separa áreas
            for (let j = i + 1; j < directions.length; j++) {
                const dir2 = directions[j];
                const nx2 = x + dir2.dx;
                const ny2 = y + dir2.dy;
                
                if (nx2 >= 0 && nx2 < MAZE_WIDTH && ny2 >= 0 && ny2 < MAZE_HEIGHT && 
                    game.maze[ny2][nx2] === 0) {
                    // Si los dos caminos están en direcciones opuestas, es un cuello de botella
                    if (Math.abs(dir1.dx + dir2.dx) === 0 && Math.abs(dir1.dy + dir2.dy) === 0) {
                        hasSeparation = true;
                    }
                }
            }
        }
    }
    
    return accessiblePaths === 2 && hasSeparation;
}

// Colocar power-ups
function placePowerUps() {
    const config = levelConfig[game.level] || levelConfig[1];
    game.powerUps = [];
    
    const candidatePositions = [];
    
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.keys.some(key => key.x === x && key.y === y) &&
                !game.doors.some(door => door.x === x && door.y === y) &&
                !game.ghosts.some(ghost => ghost.x === x && ghost.y === y)) {
                
                candidatePositions.push({x, y});
            }
        }
    }
    
    shuffleArray(candidatePositions);
    
    const powerUpCount = Math.min(config.powerUps, candidatePositions.length);
    for (let i = 0; i < powerUpCount; i++) {
        const pos = candidatePositions[i];
        game.powerUps.push({
            x: pos.x,
            y: pos.y,
            collected: false,
            type: 'ghostKill'
        });
    }
    
    console.log(`Power-ups colocados: ${game.powerUps.length}`);
}

// Colocar fantasmas MEJORADO - EVITANDO POSICIONES CERCA DEL JUGADOR
function placeGhosts() {
    const config = levelConfig[game.level] || levelConfig[1];
    game.ghosts = [];
    
    // Posiciones candidatas para fantasmas (EXCLUYENDO áreas cerca del jugador)
    const candidatePositions = [];
    const safeDistance = 5; // Distancia mínima del jugador
    
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            // Calcular distancia Manhattan al jugador
            const distanceToPlayer = Math.abs(x - game.player.x) + Math.abs(y - game.player.y);
            
            // Solo considerar celdas que son caminos, no ocupadas y SUFICIENTEMENTE LEJOS del jugador
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.keys.some(key => key.x === x && key.y === y) &&
                !game.doors.some(door => door.x === x && door.y === y) &&
                !game.powerUps.some(powerUp => powerUp.x === x && powerUp.y === y) &&
                distanceToPlayer >= safeDistance) {
                
                candidatePositions.push({x, y, distance: distanceToPlayer});
            }
        }
    }
    
    // Si no hay suficientes posiciones lejanas, reducir la distancia mínima
    let actualSafeDistance = safeDistance;
    while (candidatePositions.length < config.ghosts && actualSafeDistance > 2) {
        actualSafeDistance--;
        candidatePositions.length = 0;
        
        for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
            for (let x = 1; x < MAZE_WIDTH - 1; x++) {
                const distanceToPlayer = Math.abs(x - game.player.x) + Math.abs(y - game.player.y);
                
                if (game.maze[y][x] === 0 && 
                    !(x === game.player.x && y === game.player.y) &&
                    !(x === game.exit.x && y === game.exit.y) &&
                    !game.keys.some(key => key.x === x && key.y === y) &&
                    !game.doors.some(door => door.x === x && door.y === y) &&
                    !game.powerUps.some(powerUp => powerUp.x === x && powerUp.y === y) &&
                    distanceToPlayer >= actualSafeDistance) {
                    
                    candidatePositions.push({x, y, distance: distanceToPlayer});
                }
            }
        }
    }
    
    // Si aún no hay suficientes, usar cualquier posición disponible
    if (candidatePositions.length < config.ghosts) {
        candidatePositions.length = 0;
        for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
            for (let x = 1; x < MAZE_WIDTH - 1; x++) {
                if (game.maze[y][x] === 0 && 
                    !(x === game.player.x && y === game.player.y) &&
                    !(x === game.exit.x && y === game.exit.y) &&
                    !game.keys.some(key => key.x === x && key.y === y) &&
                    !game.doors.some(door => door.x === x && door.y === y) &&
                    !game.powerUps.some(powerUp => powerUp.x === x && powerUp.y === y)) {
                    
                    candidatePositions.push({x, y, distance: Math.abs(x - game.player.x) + Math.abs(y - game.player.y)});
                }
            }
        }
    }
    
    // Ordenar por distancia (más lejanos primero) para priorizar fantasmas lejos del jugador
    candidatePositions.sort((a, b) => b.distance - a.distance);
    
    // Colocar fantasmas estratégicamente
    const ghostCount = Math.min(config.ghosts, candidatePositions.length);
    const aggressiveGhosts = Math.floor(ghostCount / 2);
    
    // Fantasmas agresivos (pero no demasiado cerca)
    for (let i = 0; i < aggressiveGhosts; i++) {
        if (candidatePositions.length > 0) {
            // Tomar posiciones de la mitad de la lista (ni muy cerca ni muy lejos)
            const midIndex = Math.floor(candidatePositions.length / 2);
            const posIndex = Math.min(midIndex + i, candidatePositions.length - 1);
            const pos = candidatePositions.splice(posIndex, 1)[0];
            
            game.ghosts.push({
                x: pos.x,
                y: pos.y,
                speed: config.ghostSpeed,
                vision: config.ghostVision,
                lastMove: Date.now(),
                type: 'aggressive',
                lastPlayerX: game.player.x,
                lastPlayerY: game.player.y,
                dead: false
            });
        }
    }
    
    // Fantasmas defensivos (cerca de la salida pero no en la misma celda)
    for (let i = aggressiveGhosts; i < ghostCount; i++) {
        if (candidatePositions.length > 0) {
            // Ordenar por distancia a la salida
            candidatePositions.sort((a, b) => {
                const distA = Math.abs(a.x - game.exit.x) + Math.abs(a.y - game.exit.y);
                const distB = Math.abs(b.x - game.exit.x) + Math.abs(b.y - game.exit.y);
                return distA - distB;
            });
            
            // Tomar posiciones cerca de la salida pero no adyacentes
            let pos;
            for (let j = 0; j < candidatePositions.length; j++) {
                const distanceToExit = Math.abs(candidatePositions[j].x - game.exit.x) + 
                                     Math.abs(candidatePositions[j].y - game.exit.y);
                if (distanceToExit > 1 && distanceToExit <= 4) {
                    pos = candidatePositions.splice(j, 1)[0];
                    break;
                }
            }
            
            // Si no encontramos posición ideal, tomar la primera disponible
            if (!pos && candidatePositions.length > 0) {
                pos = candidatePositions.shift();
            }
            
            if (pos) {
                game.ghosts.push({
                    x: pos.x,
                    y: pos.y,
                    speed: config.ghostSpeed,
                    vision: config.ghostVision,
                    lastMove: Date.now(),
                    type: 'defensive',
                    patrolIndex: 0,
                    dead: false
                });
            }
        }
    }
    
    console.log(`Colocados ${game.ghosts.length} fantasmas. Distancia mínima al jugador: ${actualSafeDistance}`);
}

// Función AUXILIAR para verificar si una posición es segura para el jugador
function isPlayerStartSafe() {
    const directions = [
        {dx: 0, dy: -1}, {dx: 1, dy: 0}, 
        {dx: 0, dy: 1}, {dx: -1, dy: 0}
    ];
    
    // Verificar que haya al menos 2 direcciones libres alrededor del jugador
    let freeDirections = 0;
    for (const dir of directions) {
        const checkX = game.player.x + dir.dx;
        const checkY = game.player.y + dir.dy;
        if (isValidPosition(checkX, checkY)) {
            freeDirections++;
        }
    }
    
    return freeDirections >= 2;
}

// Generar laberinto CON VERIFICACIÓN DE SEGURIDAD MEJORADA
function generateMaze() {
    console.log(`Generando nivel ${game.level}...`);
    const config = levelConfig[game.level] || levelConfig[1];
    
    let safeGeneration = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Reintentar la generación hasta que sea segura
    while (!safeGeneration && attempts < maxAttempts) {
        attempts++;
        
        // Inicializar el laberinto completamente lleno de paredes
        game.maze = [];
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            game.maze[y] = [];
            for (let x = 0; x < MAZE_WIDTH; x++) {
                game.maze[y][x] = 1;
            }
        }
        
        // Posición inicial para generar el laberinto (siempre impar)
        const startX = 1;
        const startY = 1;
        
        // Usar DFS para generar un laberinto navegable
        generateMazeDFS(startX, startY);
        
        // Asegurar que los bordes sean paredes
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                if (x === 0 || y === 0 || x === MAZE_WIDTH - 1 || y === MAZE_HEIGHT - 1) {
                    game.maze[y][x] = 1;
                }
            }
        }
        
        // Crear algunos caminos adicionales para hacer el laberinto más interesante
        createAdditionalPaths();
        
        // Posición del jugador
        game.player = { x: startX, y: startY };
        
        // Salida en una posición aleatoria en el borde opuesto
        let exitX, exitY;
        let exitAttempts = 0;
        do {
            // Buscar una posición válida para la salida
            exitX = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1;
            exitY = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1;
            exitAttempts++;
            
            // Si hay demasiados intentos, usar una posición por defecto
            if (exitAttempts > 100) {
                exitX = MAZE_WIDTH - 2;
                exitY = MAZE_HEIGHT - 2;
                break;
            }
        } while (game.maze[exitY][exitX] === 1 || 
                 (exitX === startX && exitY === startY) ||
                 !isReachable(startX, startY, exitX, exitY));
        
        game.exit = { x: exitX, y: exitY };
        
        // Colocar puertas
        placeDoors();
        
        // Colocar llaves
        placeKeys();
        
        // Colocar fantasmas (con la nueva función mejorada)
        placeGhosts();
        
        // COLOCAR POWER-UPS
        placePowerUps();
        
        // Verificar que la posición del jugador sea segura
        safeGeneration = isPlayerStartSafe() && game.ghosts.length > 0;
        
        if (!safeGeneration) {
            console.log(`Intento ${attempts}: Generación no segura, reintentando...`);
        }
    }
    
    if (attempts >= maxAttempts) {
        console.warn("No se pudo generar un laberinto completamente seguro después de " + maxAttempts + " intentos");
    }
    
    console.log(`Laberinto generado exitosamente después de ${attempts} intentos`);
    console.log(`Posición jugador: (${game.player.x}, ${game.player.y})`);
    console.log(`Fantasmas colocados: ${game.ghosts.length}`);
    game.ghosts.forEach((ghost, i) => {
        const distance = Math.abs(ghost.x - game.player.x) + Math.abs(ghost.y - game.player.y);
        console.log(`Fantasma ${i}: (${ghost.x}, ${ghost.y}) - Distancia: ${distance}`);
    });
}

// Bucle principal del juego
function gameLoop() {
    if (!game.running || game.paused) return;
    
    const currentTime = Date.now();
    const deltaTime = (currentTime - game.lastTime) / 1000;
    game.lastTime = currentTime;
    
    update(deltaTime);
    drawGame();
    
    if (game.running && !game.paused) {
        game.gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// Actualizar lógica del juego
function update(deltaTime) {
    if (game.messageTimer > 0) {
        game.messageTimer -= deltaTime;
        if (game.messageTimer <= 0) {
            game.message = '';
        }
    }
    
    // Actualizar temporizador del modo cazafantasmas
    if (game.ghostKillMode) {
        game.ghostKillTimer -= deltaTime;
        if (game.ghostKillTimer <= 0) {
            game.ghostKillMode = false;
            game.message = 'Modo cazafantasmas terminado';
            game.messageTimer = 2;
        }
    }
    
    if (game.keysCollected >= game.keysRequired && game.exitLocked) {
        game.message = '¡Ve a la salida y presiona E para abrir!';
        game.messageTimer = 2;
    }
    
    game.timeLeft -= deltaTime;
    if (game.timeLeft <= 0) {
        gameOver();
        return;
    }
    
    updateUI();
    updateGhosts();
    updateParticles(deltaTime);
    checkCollisions();
}

// Función para activar el modo cazafantasmas
function activateGhostKillMode() {
    game.ghostKillMode = true;
    game.ghostKillTimer = game.ghostKillDuration;
    game.lastKillTime = Date.now();
    
    // Efecto visual especial
    createParticleEffect(game.player.x, game.player.y, 20, COLORS.powerUp);
    
    console.log('Modo cazafantasmas activado por ' + game.ghostKillDuration + ' segundos');
}

// Función para matar un fantasma temporalmente
function killGhost(ghost) {
    ghost.dead = true;
    ghost.deathTime = Date.now();
    ghost.respawnTime = 8; // segundos hasta respawn
    
    game.message = '¡Fantasma eliminado!';
    game.messageTimer = 2;
    
    // Efecto visual de muerte
    createParticleEffect(ghost.x, ghost.y, 12, COLORS.ghostDead);
    
    console.log('Fantasma eliminado temporalmente');
}

// Función para respawnear un fantasma
function respawnGhost(ghost) {
    const candidatePositions = [];
    const safeDistance = 3;
    
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            const distanceToPlayer = Math.abs(x - game.player.x) + Math.abs(y - game.player.y);
            
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.keys.some(key => key.x === x && key.y === y) &&
                !game.doors.some(door => door.x === x && door.y === y) &&
                !game.powerUps.some(powerUp => powerUp.x === x && powerUp.y === y && !powerUp.collected) &&
                distanceToPlayer >= safeDistance) {
                
                candidatePositions.push({x, y});
            }
        }
    }
    
    if (candidatePositions.length > 0) {
        const randomPos = candidatePositions[Math.floor(Math.random() * candidatePositions.length)];
        ghost.x = randomPos.x;
        ghost.y = randomPos.y;
        console.log(`Fantasma respawneado en (${ghost.x}, ${ghost.y})`);
    }
}

// Actualizar fantasmas MEJORADO con IA
function updateGhosts() {
    const now = Date.now();
    
    game.ghosts.forEach(ghost => {
        // Verificar si el fantasma debe respawnear
        if (ghost.dead) {
            const timeDead = (now - ghost.deathTime) / 1000;
            if (timeDead >= ghost.respawnTime) {
                ghost.dead = false;
                // Recolocar el fantasma en una posición aleatoria segura
                respawnGhost(ghost);
                game.message = '¡Cuidado! Un fantasma ha reaparecido';
                game.messageTimer = 2;
            }
            return; // Fantasma muerto no se mueve
        }
        
        // Movimiento normal del fantasma (existente)
        if (now - ghost.lastMove > 1000 / ghost.speed) {
            let targetX, targetY;
            
            if (ghost.type === 'aggressive') {
                if (canSeePlayer(ghost)) {
                    ghost.lastPlayerX = game.player.x;
                    ghost.lastPlayerY = game.player.y;
                    targetX = game.player.x;
                    targetY = game.player.y;
                } else {
                    targetX = ghost.lastPlayerX;
                    targetY = ghost.lastPlayerY;
                }
            } else {
                const patrolPoints = [
                    {x: game.exit.x, y: game.exit.y},
                    {x: game.exit.x + 2, y: game.exit.y},
                    {x: game.exit.x, y: game.exit.y + 2},
                    {x: game.exit.x - 2, y: game.exit.y},
                    {x: game.exit.x, y: game.exit.y - 2}
                ];
                
                targetX = patrolPoints[ghost.patrolIndex].x;
                targetY = patrolPoints[ghost.patrolIndex].y;
                
                if (Math.abs(ghost.x - targetX) + Math.abs(ghost.y - targetY) < 2) {
                    ghost.patrolIndex = (ghost.patrolIndex + 1) % patrolPoints.length;
                }
            }
            
            const directions = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ];
            
            directions.sort((a, b) => {
                const distA = Math.abs((ghost.x + a.dx) - targetX) + Math.abs((ghost.y + a.dy) - targetY);
                const distB = Math.abs((ghost.x + b.dx) - targetX) + Math.abs((ghost.y + b.dy) - targetY);
                return distA - distB;
            });
            
            for (const dir of directions) {
                const newX = ghost.x + dir.dx;
                const newY = ghost.y + dir.dy;
                
                if (newX >= 0 && newX < MAZE_WIDTH && 
                    newY >= 0 && newY < MAZE_HEIGHT && 
                    game.maze[newY][newX] === 0) {
                    
                    ghost.x = newX;
                    ghost.y = newY;
                    ghost.lastMove = now;
                    break;
                }
            }
        }
    });
}

// Verificar si un fantasma puede ver al jugador
function canSeePlayer(ghost) {
    const dx = Math.abs(ghost.x - game.player.x);
    const dy = Math.abs(ghost.y - game.player.y);
    
    // Verificar si el jugador está dentro del rango de visión
    if (dx + dy <= ghost.vision) {
        // Verificar línea de visión (sin paredes en el camino)
        let hasLineOfSight = true;
        
        // Comprobar línea horizontal
        if (ghost.y === game.player.y) {
            const minX = Math.min(ghost.x, game.player.x);
            const maxX = Math.max(ghost.x, game.player.x);
            for (let x = minX + 1; x < maxX; x++) {
                if (game.maze[ghost.y][x] === 1) {
                    hasLineOfSight = false;
                    break;
                }
            }
        }
        // Comprobar línea vertical
        else if (ghost.x === game.player.x) {
            const minY = Math.min(ghost.y, game.player.y);
            const maxY = Math.max(ghost.y, game.player.y);
            for (let y = minY + 1; y < maxY; y++) {
                if (game.maze[y][ghost.x] === 1) {
                    hasLineOfSight = false;
                    break;
                }
            }
        }
        // Comprobar diagonal (aproximación)
        else {
            // Para simplificar, en diagonales consideramos que hay visión si no hay paredes en un área pequeña
            const steps = Math.max(dx, dy);
            for (let i = 1; i < steps; i++) {
                const checkX = Math.round(ghost.x + (game.player.x - ghost.x) * i / steps);
                const checkY = Math.round(ghost.y + (game.player.y - ghost.y) * i / steps);
                
                if (game.maze[checkY][checkX] === 1) {
                    hasLineOfSight = false;
                    break;
                }
            }
        }
        
        return hasLineOfSight;
    }
    
    return false;
}

// Verificar colisiones
function checkCollisions() {
    // Colisiones con llaves (existente)
    game.keys.forEach(key => {
        if (!key.collected && game.player.x === key.x && game.player.y === key.y) {
            key.collected = true;
            game.keysCollected++;
            const remaining = game.keysRequired - game.keysCollected;
            game.message = `¡Llave encontrada! (${remaining} restante${remaining !== 1 ? 's' : ''})`;
            game.messageTimer = 2;
            createParticleEffect(key.x, key.y, 10, COLORS.key);
        }
    });
    
    // Colisiones con power-ups (NUEVO)
    game.powerUps.forEach(powerUp => {
        if (!powerUp.collected && game.player.x === powerUp.x && game.player.y === powerUp.y) {
            powerUp.collected = true;
            activateGhostKillMode();
            game.message = '¡MODO CAZAFANTASMAS ACTIVADO!';
            game.messageTimer = 3;
            createParticleEffect(powerUp.x, powerUp.y, 15, COLORS.powerUp);
        }
    });
    
    // Colisiones con fantasmas (MODIFICADA)
    game.ghosts.forEach(ghost => {
        if (game.player.x === ghost.x && game.player.y === ghost.y) {
            if (game.ghostKillMode && !ghost.dead) {
                // Matar fantasma temporalmente
                killGhost(ghost);
            } else if (!ghost.dead) {
                // Game over si el fantasma no está muerto
                gameOver();
            }
        }
    });
    
    // Colisión con salida (existente)
    if (game.player.x === game.exit.x && game.player.y === game.exit.y) {
        if (!game.exitLocked) {
            levelComplete();
        }
    }
}

// Dibujar juego MEJORADO visualmente
function drawGame() {
    // Limpiar canvas con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, COLORS.pathGradient1);
    gradient.addColorStop(1, COLORS.pathGradient2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar laberinto con efecto de profundidad
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (game.maze[y][x] === 1) {
                // Pared con efecto 3D
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Efecto de relieve en las paredes
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // Dibujar llaves con efecto de brillo
    game.keys.forEach(key => {
        if (!key.collected) {
            // Cuerpo de la llave
            ctx.fillStyle = COLORS.key;
            ctx.fillRect(
                key.x * CELL_SIZE + 7, 
                key.y * CELL_SIZE + 7, 
                CELL_SIZE - 14, 
                CELL_SIZE - 14
            );
            
            // Efecto de brillo
            ctx.fillStyle = COLORS.keyGlow;
            ctx.fillRect(
                key.x * CELL_SIZE + 10, 
                key.y * CELL_SIZE + 10, 
                CELL_SIZE - 20, 
                CELL_SIZE - 20
            );
            
            // Aro de la llave
            ctx.fillStyle = '#e67e22';
            ctx.beginPath();
            ctx.arc(
                key.x * CELL_SIZE + CELL_SIZE/2,
                key.y * CELL_SIZE + CELL_SIZE/2 - 3,
                5, 0, Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    // Dibujar power-ups (NUEVO)
    game.powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
            // Cuerpo del power-up
            ctx.fillStyle = COLORS.powerUp;
            ctx.fillRect(
                powerUp.x * CELL_SIZE + 6, 
                powerUp.y * CELL_SIZE + 6, 
                CELL_SIZE - 12, 
                CELL_SIZE - 12
            );
            
            // Efecto de brillo
            ctx.fillStyle = COLORS.powerUpGlow;
            ctx.fillRect(
                powerUp.x * CELL_SIZE + 9, 
                powerUp.y * CELL_SIZE + 9, 
                CELL_SIZE - 18, 
                CELL_SIZE - 18
            );
            
            // Símbolo de poder
            ctx.fillStyle = COLORS.text;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                '⚡',
                powerUp.x * CELL_SIZE + CELL_SIZE/2,
                powerUp.y * CELL_SIZE + CELL_SIZE/2
            );
        }
    });
    
    // Dibujar puertas con mejor diseño
    game.doors.forEach(door => {
        if (door.opened) {
            // Puerta abierta
            ctx.fillStyle = COLORS.doorOpen;
            ctx.fillRect(
                door.x * CELL_SIZE + 2,
                door.y * CELL_SIZE + 2,
                CELL_SIZE - 4,
                CELL_SIZE - 4
            );
            
            // Indicador de puerta abierta
            ctx.fillStyle = COLORS.text;
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                '✓',
                door.x * CELL_SIZE + CELL_SIZE/2,
                door.y * CELL_SIZE + CELL_SIZE/2
            );
        } else {
            // Puerta cerrada con diseño mejorado
            ctx.fillStyle = COLORS.doorLocked;
            ctx.fillRect(
                door.x * CELL_SIZE + 3,
                door.y * CELL_SIZE + 3,
                CELL_SIZE - 6,
                CELL_SIZE - 6
            );
            
            // Cerradura
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(
                door.x * CELL_SIZE + CELL_SIZE/2 - 3,
                door.y * CELL_SIZE + CELL_SIZE/2 - 3,
                6,
                6
            );
            
            // Número de llaves requeridas
            ctx.fillStyle = COLORS.text;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                door.requiredKeys.toString(),
                door.x * CELL_SIZE + CELL_SIZE/2,
                door.y * CELL_SIZE + CELL_SIZE/2 + 10
            );
        }
    });
    
    // Dibujar salida con diseño mejorado
    if (game.exit) {
        if (game.exitLocked) {
            // Salida bloqueada
            ctx.fillStyle = COLORS.exitLocked;
            ctx.fillRect(
                game.exit.x * CELL_SIZE + 4,
                game.exit.y * CELL_SIZE + 4,
                CELL_SIZE - 8,
                CELL_SIZE - 8
            );
            
            // Candado
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(
                game.exit.x * CELL_SIZE + CELL_SIZE/2 - 4,
                game.exit.y * CELL_SIZE + CELL_SIZE/2 - 4,
                8,
                8
            );
        } else {
            // Salida desbloqueada con efecto de brillo
            ctx.fillStyle = COLORS.exit;
            ctx.fillRect(
                game.exit.x * CELL_SIZE + 2,
                game.exit.y * CELL_SIZE + 2,
                CELL_SIZE - 4,
                CELL_SIZE - 4
            );
            
            // Efecto de parpadeo
            const blink = Math.sin(Date.now() / 300) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(
                    game.exit.x * CELL_SIZE + 5,
                    game.exit.y * CELL_SIZE + 5,
                    CELL_SIZE - 10,
                    CELL_SIZE - 10
                );
            }
        }
        
        // Símbolo de puerta
        ctx.fillStyle = COLORS.text;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            game.exitLocked ? '🔒' : '🚪',
            game.exit.x * CELL_SIZE + CELL_SIZE/2,
            game.exit.y * CELL_SIZE + CELL_SIZE/2
        );
    }
    
    // Dibujar partículas
    drawParticles();
    
    // Dibujar jugador con diseño mejorado
    if (game.player) {
        // Cuerpo del jugador
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(
            game.player.x * CELL_SIZE + 5,
            game.player.y * CELL_SIZE + 5,
            CELL_SIZE - 10,
            CELL_SIZE - 10
        );
        
        // Efecto de brillo
        ctx.fillStyle = COLORS.playerGlow;
        ctx.fillRect(
            game.player.x * CELL_SIZE + 7,
            game.player.y * CELL_SIZE + 7,
            CELL_SIZE - 14,
            CELL_SIZE - 14
        );
        
        // Ojos del jugador
        ctx.fillStyle = COLORS.ghostEyes;
        ctx.fillRect(
            game.player.x * CELL_SIZE + 10,
            game.player.y * CELL_SIZE + 10,
            4,
            4
        );
        ctx.fillRect(
            game.player.x * CELL_SIZE + CELL_SIZE - 14,
            game.player.y * CELL_SIZE + 10,
            4,
            4
        );
    }
    
    // Dibujar fantasmas con diseño mejorado
    game.ghosts.forEach(ghost => {
        if (ghost.dead) {
            // Fantasma muerto (fantasma)
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = COLORS.ghostDead;
            ctx.fillRect(
                ghost.x * CELL_SIZE + 5,
                ghost.y * CELL_SIZE + 5,
                CELL_SIZE - 10,
                CELL_SIZE - 10
            );
            
            // Cruz sobre el fantasma muerto
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ghost.x * CELL_SIZE + 8, ghost.y * CELL_SIZE + 8);
            ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 8, ghost.y * CELL_SIZE + CELL_SIZE - 8);
            ctx.moveTo(ghost.x * CELL_SIZE + CELL_SIZE - 8, ghost.y * CELL_SIZE + 8);
            ctx.lineTo(ghost.x * CELL_SIZE + 8, ghost.y * CELL_SIZE + CELL_SIZE - 8);
            ctx.stroke();
            
            ctx.globalAlpha = 1.0;
        } else {
            // Fantasma normal (código existente)
            ctx.fillStyle = COLORS.ghost;
            ctx.fillRect(
                ghost.x * CELL_SIZE + 5,
                ghost.y * CELL_SIZE + 5,
                CELL_SIZE - 10,
                CELL_SIZE - 10
            );
            
            ctx.fillStyle = COLORS.ghostGlow;
            ctx.fillRect(
                ghost.x * CELL_SIZE + 7,
                ghost.y * CELL_SIZE + 7,
                CELL_SIZE - 14,
                CELL_SIZE - 14
            );
            
            ctx.fillStyle = COLORS.ghostEyes;
            ctx.fillRect(
                ghost.x * CELL_SIZE + 10,
                ghost.y * CELL_SIZE + 10,
                3,
                3
            );
            ctx.fillRect(
                ghost.x * CELL_SIZE + CELL_SIZE - 13,
                ghost.y * CELL_SIZE + 10,
                3,
                3
            );
            
            if (ghost.type === 'aggressive') {
                ctx.fillStyle = '#e74c3c';
            } else {
                ctx.fillStyle = '#3498db';
            }
            ctx.fillRect(
                ghost.x * CELL_SIZE + 11,
                ghost.y * CELL_SIZE + 11,
                1,
                1
            );
            ctx.fillRect(
                ghost.x * CELL_SIZE + CELL_SIZE - 12,
                ghost.y * CELL_SIZE + 11,
                1,
                1
            );
        }
    });
    
    // Efecto visual cuando el modo cazafantasmas está activo (NUEVO)
    if (game.ghostKillMode) {
        // Borde brillante alrededor del jugador
        ctx.strokeStyle = COLORS.powerUp;
        ctx.lineWidth = 3;
        ctx.shadowColor = COLORS.powerUpGlow;
        ctx.shadowBlur = 10;
        ctx.strokeRect(
            game.player.x * CELL_SIZE + 2,
            game.player.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );
        ctx.shadowBlur = 0;
        
        // Parpadeo del temporizador
        const blink = Math.sin(Date.now() / 200) > 0;
        if (blink) {
            ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Dibujar HUD mejorado
    drawHUD();
    
    // Dibujar mensajes con mejor diseño
    if (game.message && game.messageTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 20, 300, 40);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 150, canvas.height/2 - 20, 300, 40);
        
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(game.message, canvas.width/2, canvas.height/2);
    }
}

// Dibujar HUD MEJORADO
function drawHUD() {
    // Fondo del HUD
    ctx.fillStyle = 'rgba(44, 62, 80, 0.8)';
    ctx.fillRect(5, 5, canvas.width - 10, 40);
    
    // Borde del HUD
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, canvas.width - 10, 40);
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Nivel
    ctx.fillText(`NIVEL ${game.level}`, 10, 10);
    
    // Fantasmas
    ctx.fillText(`FANTASMAS: ${game.ghosts.length}`, canvas.width/2 - 50, 10);
    
    
    // Mostrar temporizador del modo cazafantasmas (NUEVO)
    if (game.ghostKillMode) {
        ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
        ctx.fillRect(canvas.width/2 - 60, 45, 120, 20);
        
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            `CAZAFANTASMAS: ${Math.ceil(game.ghostKillTimer)}s`,
            canvas.width/2,
            55
        );
    }
    
    // Mostrar contador de power-ups recolectados (NUEVO)
    const powerUpsCollected = game.powerUps.filter(p => p.collected).length;
    const totalPowerUps = game.powerUps.length;
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`PODERES: ${powerUpsCollected}/${totalPowerUps}`, canvas.width/2 + 30, 27);
    
    
}

// Game Over
function gameOver() {
    game.running = false;
    if (gameOverElement) gameOverElement.style.display = 'block';
    cancelAnimationFrame(game.gameLoopId);
}

// Nivel completado
function levelComplete() {
    game.running = false;
    
    // Actualizar información en la pantalla de nivel completado
    if (finalLevelElement) finalLevelElement.textContent = game.level;
    if (finalKeysElement) finalKeysElement.textContent = `${game.keysCollected}/${game.keysRequired}`;
    
    // Mostrar estrellas según el rendimiento
    if (stars) {
        const timeRatio = game.timeLeft / game.totalTime;
        if (timeRatio > 0.7) {
            // 3 estrellas
            stars.forEach(star => star.classList.add('active'));
        } else if (timeRatio > 0.4) {
            // 2 estrellas
            stars[0].classList.add('active');
            stars[1].classList.add('active');
        } else {
            // 1 estrella
            stars[0].classList.add('active');
        }
    }
    
    if (levelCompleteElement) levelCompleteElement.style.display = 'block';
    cancelAnimationFrame(game.gameLoopId);
}

// Volver al menú
function goToMenu() {
    // En un entorno real, esto redirigiría al menú principal
    // Por ahora, simplemente reiniciamos el juego
    resetGame();
}

// Iniciar cuando se carga la página
window.addEventListener('load', function() {
    console.log('Página cargada, iniciando juego COMPLETO...');
    init();
});
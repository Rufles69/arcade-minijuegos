// ghost-maze.js - Juego Laberinto Fantasma COMPLETO Y REPARADO

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

// Configuración del juego
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
    exit: null,
    message: '',
    messageTimer: 0,
    showExit: true,
    exitLocked: true
};

// Tamaño de las celdas del laberinto
const CELL_SIZE = 30;
const MAZE_WIDTH = 15;
const MAZE_HEIGHT = 15;

// Ajustar tamaño del canvas
canvas.width = MAZE_WIDTH * CELL_SIZE;
canvas.height = MAZE_HEIGHT * CELL_SIZE;

// Colores
const COLORS = {
    wall: '#34495e',
    path: '#2c3e50',
    player: '#e74c3c',
    ghost: '#9b59b6',
    key: '#f1c40f',
    door: '#e67e22',
    doorOpen: '#27ae60',
    doorLocked: '#c0392b',
    exit: '#27ae60',
    exitLocked: '#e74c3c',
    text: '#ecf0f1',
    progressBg: '#34495e',
    progressFill: '#3498db'
};

// Configuración de niveles
const levelConfig = {
    1: { time: 120, ghosts: 1, keys: 4, doors: 2, ghostSpeed: 0.8 },
    2: { time: 120, ghosts: 2, keys: 5, doors: 3, ghostSpeed: 1.0 },
    3: { time: 120, ghosts: 3, keys: 6, doors: 4, ghostSpeed: 1.2 }
};

// Inicializar el juego
function init() {
    console.log('Inicializando Laberinto Fantasma...');
    
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

// Dibujar pantalla inicial
function drawInitialScreen() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LABERINTO FANTASMA', canvas.width/2, canvas.height/2 - 30);
    ctx.font = '14px Arial';
    ctx.fillText('Presiona INICIAR JUEGO', canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('Usa las flechas para moverte', canvas.width/2, canvas.height/2 + 30);
    ctx.fillText('Presiona E para abrir puertas', canvas.width/2, canvas.height/2 + 50);
    ctx.textAlign = 'left';
}

// Configurar controles móviles
function setupMobileControls() {
    mobileBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.getAttribute('data-direction');
            handleMobileInput(direction);
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
    game.message = '';
    game.messageTimer = 0;
    game.showExit = true;
    game.exitLocked = true;
    
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
    game.keysRequired = 3;
    game.doorsOpened = 0;
    game.ghosts = [];
    game.keys = [];
    game.doors = [];
    game.message = '';
    game.messageTimer = 0;
    game.showExit = true;
    game.exitLocked = true;
    
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

// Generar laberinto NAVEABLE
function generateMaze() {
    console.log(`Generando nivel ${game.level}...`);
    const config = levelConfig[game.level];
    
    // Inicializar el laberinto completamente lleno de paredes
    game.maze = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        game.maze[y] = [];
        for (let x = 0; x < MAZE_WIDTH; x++) {
            game.maze[y][x] = 1; // 1 = pared
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
    
    // Posición del jugador
    game.player = { x: startX, y: startY };
    
    // Salida en una posición aleatoria en el borde opuesto
    let exitX, exitY;
    let attempts = 0;
    do {
        // Buscar una posición válida para la salida
        exitX = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1;
        exitY = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1;
        attempts++;
        
        // Si hay demasiados intentos, usar una posición por defecto
        if (attempts > 50) {
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
    
    // Colocar fantasmas
    placeGhosts();
    
    console.log("Laberinto generado exitosamente");
}

// Colocar puertas (versión mejorada)
function placeDoors() {
    const config = levelConfig[game.level];
    game.doors = [];
    
    // Posiciones candidatas para puertas (en caminos)
    const candidatePositions = [];
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            // Solo considerar celdas que son caminos y no están ocupadas
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y)) {
                
                // Verificar que la puerta no bloquee el único camino
                if (countNeighbors(x, y) >= 2) {
                    candidatePositions.push({x, y});
                }
            }
        }
    }
    
    // Mezclar posiciones candidatas
    shuffleArray(candidatePositions);
    
    // Colocar puertas
    for (let i = 0; i < config.doors && i < candidatePositions.length; i++) {
        const pos = candidatePositions[i];
        game.doors.push({
            x: pos.x,
            y: pos.y,
            requiredKeys: Math.min(2, i + 1),
            opened: false
        });
    }
}

// Colocar llaves (versión mejorada)
function placeKeys() {
    const config = levelConfig[game.level];
    game.keys = [];
    
    // Posiciones candidatas para llaves (en caminos)
    const candidatePositions = [];
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            // Solo considerar celdas que son caminos y no están ocupadas
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.doors.some(door => door.x === x && door.y === y)) {
                
                candidatePositions.push({x, y});
            }
        }
    }
    
    // Mezclar posiciones candidatas
    shuffleArray(candidatePositions);
    
    // Colocar llaves
    for (let i = 0; i < config.keys && i < candidatePositions.length; i++) {
        const pos = candidatePositions[i];
        game.keys.push({
            x: pos.x,
            y: pos.y,
            collected: false
        });
    }
}

// Colocar fantasmas
function placeGhosts() {
    const config = levelConfig[game.level];
    game.ghosts = [];
    
    // Posiciones candidatas para fantasmas
    const candidatePositions = [];
    for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            // Solo considerar celdas que son caminos y no están ocupadas
            if (game.maze[y][x] === 0 && 
                !(x === game.player.x && y === game.player.y) &&
                !(x === game.exit.x && y === game.exit.y) &&
                !game.keys.some(key => key.x === x && key.y === y) &&
                !game.doors.some(door => door.x === x && door.y === y)) {
                
                candidatePositions.push({x, y});
            }
        }
    }
    
    // Mezclar posiciones candidatas
    shuffleArray(candidatePositions);
    
    // Colocar fantasmas
    for (let i = 0; i < config.ghosts && i < candidatePositions.length; i++) {
        const pos = candidatePositions[i];
        game.ghosts.push({
            x: pos.x,
            y: pos.y,
            speed: config.ghostSpeed,
            lastMove: Date.now()
        });
    }
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
    checkCollisions();
}

// Actualizar fantasmas
function updateGhosts() {
    const now = Date.now();
    
    game.ghosts.forEach(ghost => {
        if (now - ghost.lastMove > 1000 / ghost.speed) {
            const directions = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ];
            
            const validDirections = directions.filter(dir => {
                const newX = ghost.x + dir.dx;
                const newY = ghost.y + dir.dy;
                return newX >= 0 && newX < MAZE_WIDTH && 
                       newY >= 0 && newY < MAZE_HEIGHT && 
                       game.maze[newY][newX] === 0;
            });
            
            if (validDirections.length > 0) {
                const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
                ghost.x += randomDir.dx;
                ghost.y += randomDir.dy;
                ghost.lastMove = now;
            }
        }
    });
}

// Verificar colisiones
function checkCollisions() {
    game.keys.forEach(key => {
        if (!key.collected && game.player.x === key.x && game.player.y === key.y) {
            key.collected = true;
            game.keysCollected++;
            const remaining = game.keysRequired - game.keysCollected;
            game.message = `¡Llave encontrada! (${remaining} restante${remaining !== 1 ? 's' : ''})`;
            game.messageTimer = 2;
        }
    });
    
    if (game.player.x === game.exit.x && game.player.y === game.exit.y) {
        if (!game.exitLocked) {
            levelComplete();
        }
    }
    
    game.ghosts.forEach(ghost => {
        if (game.player.x === ghost.x && game.player.y === ghost.y) {
            gameOver();
        }
    });
}

// Dibujar juego
function drawGame() {
    // Limpiar canvas
    ctx.fillStyle = COLORS.path;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar laberinto
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (game.maze[y][x] === 1) {
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // Dibujar llaves
    game.keys.forEach(key => {
        if (!key.collected) {
            ctx.fillStyle = COLORS.key;
            ctx.fillRect(
                key.x * CELL_SIZE + 5, 
                key.y * CELL_SIZE + 5, 
                CELL_SIZE - 10, 
                CELL_SIZE - 10
            );
        }
    });
    
    // Dibujar puertas
    game.doors.forEach(door => {
        ctx.fillStyle = door.opened ? COLORS.doorOpen : COLORS.doorLocked;
        ctx.fillRect(
            door.x * CELL_SIZE + 2,
            door.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );
        
        if (!door.opened) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                door.requiredKeys.toString(),
                door.x * CELL_SIZE + CELL_SIZE/2,
                door.y * CELL_SIZE + CELL_SIZE/2
            );
        }
    });
    
    // Dibujar salida
    if (game.exit) {
        ctx.fillStyle = game.exitLocked ? COLORS.exitLocked : COLORS.exit;
        ctx.fillRect(
            game.exit.x * CELL_SIZE + 2,
            game.exit.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );
        
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
    
    // Dibujar jugador
    if (game.player) {
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(
            game.player.x * CELL_SIZE + 4,
            game.player.y * CELL_SIZE + 4,
            CELL_SIZE - 8,
            CELL_SIZE - 8
        );
    }
    
    // Dibujar fantasmas
    game.ghosts.forEach(ghost => {
        ctx.fillStyle = COLORS.ghost;
        ctx.fillRect(
            ghost.x * CELL_SIZE + 4,
            ghost.y * CELL_SIZE + 4,
            CELL_SIZE - 8,
            CELL_SIZE - 8
        );
    });
    
    // Dibujar HUD
    drawHUD();
    
    // Dibujar mensajes
    if (game.message && game.messageTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(canvas.width/2 - 120, canvas.height/2 - 15, 240, 30);
        
        ctx.fillStyle = COLORS.text;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(game.message, canvas.width/2, canvas.height/2);
    }
}

// Dibujar HUD
function drawHUD() {
    ctx.fillStyle = 'rgba(52, 73, 94, 0.8)';
    ctx.fillRect(5, 5, canvas.width - 10, 35);
    
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`NIVEL ${game.level}`, 10, 10);
    ctx.fillText(`LLAVES: ${game.keysCollected}/${game.keysRequired}`, 10, 25);
    ctx.fillText(`TIEMPO: ${Math.ceil(game.timeLeft)}`, canvas.width - 80, 10);
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
    console.log('Página cargada, iniciando juego...');
    init();
});
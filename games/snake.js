// snake.js - Código completo y corregido

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highscoreElement = document.getElementById('highscore');
const gameStateElement = document.getElementById('gameState');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const earnedStarsElement = document.getElementById('earnedStars');
const pausedScreen = document.getElementById('pausedScreen');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stars = document.querySelectorAll('.star');
const mobileBtns = document.querySelectorAll('.mobile-btn');

// Configuración del juego
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Variables del juego
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let level = 1;
let gameSpeed = 150;
let gameRunning = false;
let gamePaused = false;
let highscore = 0;
let gameLoopId = null;

// Colores
const colors = {
    background: '#0f3460',
    snakeHead: '#4cd137',
    snakeBody: '#44bd32', 
    snakeOutline: '#2f8c24',
    food: '#e94560',
    foodOutline: '#c2334d',
    grid: 'rgba(255, 255, 255, 0.05)'
};

// Inicializar el juego
function init() {
    console.log('Inicializando juego Snake...');
    
    // Cargar highscore
    highscore = parseInt(localStorage.getItem('snake-highscore')) || 0;
    highscoreElement.textContent = highscore;
    
    // Configurar event listeners
    document.addEventListener('keydown', handleKeyPress);
    restartBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', goToMenu);
    playAgainBtn.addEventListener('click', resetGame);
    resumeBtn.addEventListener('click', togglePause);
    
    // Controles móviles
    mobileBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.getAttribute('data-direction');
            handleMobileDirection(direction);
        });
    });
    
    resetGame();
}

// Manejar teclas
function handleKeyPress(e) {
    switch(e.key) {
        case ' ':
            e.preventDefault();
            togglePause();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            if (!gamePaused) {
                changeDirection(e.key);
                if (!gameRunning) {
                    startGame();
                }
            }
            break;
    }
}

// Iniciar el juego
function startGame() {
    console.log('Iniciando juego...');
    gameRunning = true;
    updateGameState('JUGANDO');
    startGameLoop();
}

// Manejar controles móviles
function handleMobileDirection(direction) {
    if (gamePaused) return;
    
    if (!gameRunning) {
        startGame();
    }
    
    switch(direction) {
        case 'up':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'down':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'left':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'right':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
}

// Cambiar dirección
function changeDirection(key) {
    switch(key) {
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -1; 
                dy = 0; 
            }
            break;
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0; 
                dy = -1; 
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = 1; 
                dy = 0; 
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0; 
                dy = 1; 
            }
            break;
    }
}

// Pausar/Reanudar
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        updateGameState('PAUSADO');
        pausedScreen.style.display = 'block';
        clearTimeout(gameLoopId);
    } else {
        updateGameState('JUGANDO');
        pausedScreen.style.display = 'none';
        startGameLoop();
    }
}

// Actualizar estado del juego
function updateGameState(state) {
    gameStateElement.textContent = state;
}

// Crear comida
function createFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Verificar que no esté en la serpiente
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

// Reiniciar juego
function resetGame() {
    console.log('Reiniciando juego...');
    
    // Resetear variables
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    gameSpeed = 150;
    gameRunning = false;
    gamePaused = false;
    
    // Actualizar UI
    scoreElement.textContent = score;
    levelElement.textContent = level;
    gameOverElement.style.display = 'none';
    pausedScreen.style.display = 'none';
    updateGameState('PRESIONA UNA FLECHA');
    
    // Resetear estrellas
    stars.forEach(star => star.classList.remove('active'));
    
    // Limpiar bucle anterior
    if (gameLoopId) {
        clearTimeout(gameLoopId);
        gameLoopId = null;
    }
    
    // Crear comida y dibujar
    createFood();
    drawGame();
}

// Iniciar bucle del juego
function startGameLoop() {
    if (gameLoopId) {
        clearTimeout(gameLoopId);
    }
    gameLoop();
}

// Bucle principal del juego
function gameLoop() {
    if (!gameRunning || gamePaused) {
        return;
    }
    
    // Verificar colisiones
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Mover y dibujar
    moveSnake();
    drawGame();
    
    // Continuar bucle
    gameLoopId = setTimeout(gameLoop, gameSpeed);
}

// Mover serpiente
function moveSnake() {
    // Calcular nueva cabeza
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Verificar si come comida
    if (head.x === food.x && head.y === food.y) {
        // Aumentar puntuación
        score += 10;
        scoreElement.textContent = score;
        
        // Crear nueva comida
        createFood();
        
        // Subir nivel cada 50 puntos
        if (score % 50 === 0) {
            level++;
            levelElement.textContent = level;
            gameSpeed = Math.max(80, 150 - (level * 10));
        }
        // La serpiente crece (no se elimina la cola)
    } else {
        // Eliminar cola si no come
        snake.pop();
    }
    
    // Añadir nueva cabeza
    snake.unshift(head);
}

// Dibujar juego
function drawGame() {
    // Limpiar canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar grid
    drawGrid();
    
    // Dibujar comida
    drawFood();
    
    // Dibujar serpiente
    drawSnake();
}

// Dibujar grid
function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    
    // Líneas verticales
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Dibujar comida
function drawFood() {
    const x = food.x * gridSize;
    const y = food.y * gridSize;
    
    // Comida
    ctx.fillStyle = colors.food;
    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    
    // Borde
    ctx.strokeStyle = colors.foodOutline;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
}

// Dibujar serpiente
function drawSnake() {
    // Dibujar cuerpo
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        
        if (i === 0) {
            // Cabeza
            ctx.fillStyle = colors.snakeHead;
            ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            
            // Borde cabeza
            ctx.strokeStyle = colors.snakeOutline;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            
            // Ojos
            ctx.fillStyle = '#000';
            drawEyes(x, y);
        } else {
            // Cuerpo
            ctx.fillStyle = colors.snakeBody;
            ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            
            // Borde cuerpo
            ctx.strokeStyle = colors.snakeOutline;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        }
    }
}

// Dibujar ojos de la serpiente
function drawEyes(x, y) {
    const eyeSize = 2;
    const eyeOffset = 5;
    
    if (dx === 1) { // Derecha
        ctx.fillRect(x + gridSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(x + gridSize - eyeOffset, y + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
    } else if (dx === -1) { // Izquierda
        ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(x + eyeOffset - eyeSize, y + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
    } else if (dy === 1) { // Abajo
        ctx.fillRect(x + eyeOffset, y + gridSize - eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(x + gridSize - eyeOffset - eyeSize, y + gridSize - eyeOffset, eyeSize, eyeSize);
    } else if (dy === -1) { // Arriba
        ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
        ctx.fillRect(x + gridSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
    } else {
        // Dirección inicial (sin movimiento) - ojos centrados
        ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(x + gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
    }
}

// Verificar colisiones
function checkCollision() {
    const head = snake[0];
    
    // Colisión con bordes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Colisión con el cuerpo (empezar desde 1 para evitar la cabeza)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Game Over
function gameOver() {
    console.log('Game Over! Puntuación:', score);
    
    gameRunning = false;
    updateGameState('GAME OVER');
    
    // Calcular estrellas
    let starsEarned = 0;
    if (score >= 100) starsEarned = 3;
    else if (score >= 50) starsEarned = 2;
    else if (score >= 20) starsEarned = 1;
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        }
    });
    
    // Actualizar highscore
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('snake-highscore', highscore);
        highscoreElement.textContent = highscore;
    }
    
    // Guardar progreso
    saveProgress(starsEarned);
    
    // Mostrar pantalla de game over
    finalScoreElement.textContent = score;
    earnedStarsElement.textContent = starsEarned;
    gameOverElement.style.display = 'block';
}

// Guardar progreso
function saveProgress(starsEarned) {
    const currentStars = parseInt(localStorage.getItem('snake-stars')) || 0;
    const newStars = Math.max(currentStars, starsEarned);
    localStorage.setItem('snake-stars', newStars);
    
    // Actualizar totales
    const games = ['snake'];
    let totalPoints = 0;
    let totalStars = 0;
    
    games.forEach(game => {
        totalPoints += parseInt(localStorage.getItem(`${game}-highscore`)) || 0;
        totalStars += parseInt(localStorage.getItem(`${game}-stars`)) || 0;
    });
    
    localStorage.setItem('totalPoints', totalPoints);
    localStorage.setItem('totalStars', totalStars);
}

// Volver al menú
function goToMenu() {
    if (window.opener) {
        window.close();
    } else {
        window.location.href = '../index.html';
    }
}

// Iniciar cuando se carga la página
window.addEventListener('load', init);
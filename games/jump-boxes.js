// jump-boxes.js - Juego Salta-Cajas CON MENÚ DE PAUSA

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelElement = document.getElementById('level');
const timeElement = document.getElementById('time');
const boxesElement = document.getElementById('boxes');
const highscoreElement = document.getElementById('highscore');
const objectiveElement = document.getElementById('objective');
const progressFill = document.getElementById('progressFill');
const gameOverElement = document.getElementById('gameOver');
const levelCompleteElement = document.getElementById('levelComplete');
const pausedScreen = document.getElementById('pausedScreen'); // NUEVO
const finalLevelElement = document.getElementById('finalLevel');
const finalTimeElement = document.getElementById('finalTime');
const nextLevelElement = document.getElementById('nextLevel');
const earnedStarsElement = document.getElementById('earnedStars');
const startBtn = document.getElementById('startBtn');
const menuBtn = document.getElementById('menuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const resumeBtn = document.getElementById('resumeBtn'); // NUEVO
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');
const stars = document.querySelectorAll('.star');

// Configuración del juego
const game = {
    running: false,
    paused: false,
    level: 1,
    timeLeft: 60,
    boxesDodged: 0,
    highscore: 0,
    gravity: 0.5,
    gameLoopId: null,
    boxSpawnTimer: 0,
    boxes: [],
    particles: [],
    lastTime: 0,
    gameOverAnimation: false,
    deathTimer: 0
};

// Jugador MEJORADO
const player = {
    x: 180,
    y: 400,
    width: 40,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    speed: 6,
    jumpPower: 12,
    isJumping: false,
    facing: 'right',
    color: '#e74c3c',
    blinkTimer: 0,
    isBlinking: false
};

// Configuración de niveles
const levelConfig = {
    1: { time: 60, boxSpawnRate: 120, boxSpeed: 2 },
    2: { time: 60, boxSpawnRate: 100, boxSpeed: 2.5 },
    3: { time: 60, boxSpawnRate: 80, boxSpeed: 3 },
    4: { time: 60, boxSpawnRate: 60, boxSpeed: 3.5 },
    5: { time: 60, boxSpawnRate: 50, boxSpeed: 4 }
};

// Inicializar el juego
function init() {
    console.log('Inicializando Salta-Cajas...');
    
    // Cargar highscore
    game.highscore = parseInt(localStorage.getItem('jumpboxes-highscore')) || 0;
    highscoreElement.textContent = game.highscore;
    
    // Configurar event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    startBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', goToMenu);
    playAgainBtn.addEventListener('click', resetGame);
    nextLevelBtn.addEventListener('click', nextLevel);
    resumeBtn.addEventListener('click', togglePause); // NUEVO
    
    // Prevenir scroll con las flechas y espacio
    preventDefaultKeys();
    
    // Controles móviles
    setupMobileControls();
    
    resetGame();
}

// Prevenir comportamiento por defecto de teclas
function preventDefaultKeys() {
    const keysToPrevent = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    document.addEventListener('keydown', function(e) {
        if (keysToPrevent.includes(e.key)) {
            e.preventDefault();
        }
    });
}

// Configurar controles móviles
function setupMobileControls() {
    // Izquierda
    leftBtn.addEventListener('mousedown', moveLeft);
    leftBtn.addEventListener('mouseup', stopMoving);
    leftBtn.addEventListener('mouseleave', stopMoving);
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveLeft();
    });
    leftBtn.addEventListener('touchend', stopMoving);
    
    // Derecha
    rightBtn.addEventListener('mousedown', moveRight);
    rightBtn.addEventListener('mouseup', stopMoving);
    rightBtn.addEventListener('mouseleave', stopMoving);
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveRight();
    });
    rightBtn.addEventListener('touchend', stopMoving);
    
    // Salto
    jumpBtn.addEventListener('click', jump);
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
}

// Movimiento izquierda
function moveLeft() {
    if (game.running && !game.paused) {
        player.velocityX = -player.speed;
        player.facing = 'left';
    } else if (!game.running) {
        startGame();
        player.velocityX = -player.speed;
        player.facing = 'left';
    }
}

// Movimiento derecha
function moveRight() {
    if (game.running && !game.paused) {
        player.velocityX = player.speed;
        player.facing = 'right';
    } else if (!game.running) {
        startGame();
        player.velocityX = player.speed;
        player.facing = 'right';
    }
}

// Detener movimiento
function stopMoving() {
    player.velocityX = 0;
}

// Manejar teclas presionadas - MEJORADO
function handleKeyDown(e) {
    // Prevenir scroll
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    // ESPACIO para pausar/reanudar
    if (e.key === ' ' && game.running) {
        togglePause();
        return;
    }
    
    if (!game.running && ['ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) {
        startGame();
    }
    
    if (!game.running || game.paused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            player.velocityX = -player.speed;
            player.facing = 'left';
            break;
        case 'ArrowRight':
            player.velocityX = player.speed;
            player.facing = 'right';
            break;
        case 'ArrowUp':
            jump();
            break;
    }
}

// Manejar teclas liberadas
function handleKeyUp(e) {
    if (!game.running || game.paused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (player.velocityX < 0) player.velocityX = 0;
            break;
        case 'ArrowRight':
            if (player.velocityX > 0) player.velocityX = 0;
            break;
    }
}

// Pausar/Reanudar juego - MEJORADO
function togglePause() {
    if (!game.running) return;
    
    game.paused = !game.paused;
    
    if (game.paused) {
        // Mostrar menú de pausa
        pausedScreen.style.display = 'block';
        startBtn.textContent = 'REANUDAR';
    } else {
        // Ocultar menú de pausa
        pausedScreen.style.display = 'none';
        startBtn.textContent = 'REINICIAR';
        game.lastTime = Date.now();
        gameLoop();
    }
}

// Saltar
function jump() {
    if (!game.running) {
        startGame();
    }
    
    if (!player.isJumping && game.running && !game.paused) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
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
    
    console.log('Iniciando juego...');
    game.running = true;
    game.paused = false;
    startBtn.textContent = 'REINICIAR';
    pausedScreen.style.display = 'none'; // Asegurar que no esté visible
    updateObjective();
    game.lastTime = Date.now();
    
    if (game.gameLoopId) {
        cancelAnimationFrame(game.gameLoopId);
    }
    gameLoop();
}

// Reiniciar juego
function resetGame() {
    console.log('Reiniciando juego...');
    
    game.running = false;
    game.paused = false;
    game.gameOverAnimation = false;
    game.deathTimer = 0;
    game.level = 1;
    const config = levelConfig[game.level];
    game.timeLeft = config.time;
    game.boxesDodged = 0;
    game.boxes = [];
    game.boxSpawnTimer = 0;
    game.particles = [];
    
    player.x = 180;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.facing = 'right';
    player.blinkTimer = 0;
    player.isBlinking = false;
    
    // Actualizar UI
    updateUI();
    progressFill.style.width = '0%';
    gameOverElement.style.display = 'none';
    levelCompleteElement.style.display = 'none';
    pausedScreen.style.display = 'none'; // Ocultar pausa
    startBtn.textContent = 'INICIAR JUEGO';
    
    // Resetear estrellas
    stars.forEach(star => star.classList.remove('active'));
    
    updateObjective();
    drawGame();
}

// Actualizar UI
function updateUI() {
    levelElement.textContent = game.level;
    timeElement.textContent = Math.ceil(game.timeLeft);
    boxesElement.textContent = game.boxesDodged;
}

// Siguiente nivel
function nextLevel() {
    game.level++;
    const config = levelConfig[game.level] || levelConfig[1];
    game.timeLeft = config.time;
    game.boxesDodged = 0;
    game.boxes = [];
    game.boxSpawnTimer = 0;
    game.particles = [];
    
    player.x = 180;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    
    updateUI();
    progressFill.style.width = '0%';
    levelCompleteElement.style.display = 'none';
    pausedScreen.style.display = 'none'; // Ocultar pausa
    
    updateObjective();
    game.running = true;
    game.paused = false;
    game.lastTime = Date.now();
    gameLoop();
}

// Actualizar objetivo
function updateObjective() {
    const config = levelConfig[game.level] || levelConfig[1];
    objectiveElement.textContent = `SOBREVIVE ${config.time} SEGUNDOS`;
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
    // Si está en animación de muerte, solo actualizar partículas
    if (game.gameOverAnimation) {
        updateDeathAnimation(deltaTime);
        return;
    }
    
    // Actualizar jugador
    updatePlayer(deltaTime);
    
    // Actualizar cajas
    updateBoxes(deltaTime);
    
    // Actualizar partículas
    updateParticles(deltaTime);
    
    // Spawn de cajas
    game.boxSpawnTimer += deltaTime * 60;
    const config = levelConfig[game.level] || levelConfig[1];
    if (game.boxSpawnTimer >= config.boxSpawnRate) {
        spawnBox();
        game.boxSpawnTimer = 0;
    }
    
    // Actualizar tiempo
    game.timeLeft -= deltaTime;
    timeElement.textContent = Math.max(0, Math.ceil(game.timeLeft));
    
    // Actualizar barra de progreso
    const progress = ((config.time - game.timeLeft) / config.time) * 100;
    progressFill.style.width = Math.min(100, progress) + '%';
    
    // Verificar si completó el nivel
    if (game.timeLeft <= 0) {
        levelComplete();
        return;
    }
    
    // Verificar colisiones
    checkCollisions();
}

// Actualizar jugador
function updatePlayer(deltaTime) {
    // Animación de parpadeo
    if (player.isBlinking) {
        player.blinkTimer += deltaTime;
        if (player.blinkTimer > 0.5) {
            player.isBlinking = false;
            player.blinkTimer = 0;
        }
    }
    
    // Movimiento horizontal
    player.x += player.velocityX;
    
    // Limitar dentro de la pantalla
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Gravedad
    player.velocityY += game.gravity;
    player.y += player.velocityY;
    
    // Limitar en el suelo
    const groundLevel = canvas.height - 60;
    if (player.y + player.height > groundLevel) {
        player.y = groundLevel - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
}

// Actualizar cajas - MEJORADO (se destruyen al tocar el suelo)
function updateBoxes(deltaTime) {
    const config = levelConfig[game.level] || levelConfig[1];
    const groundLevel = canvas.height - 60;
    
    for (let i = game.boxes.length - 1; i >= 0; i--) {
        const box = game.boxes[i];
        
        // Mover caja hacia abajo
        box.y += config.boxSpeed;
        
        // Verificar si la caja toca el suelo
        if (box.y + box.height >= groundLevel) {
            // Crear efecto de partículas al tocar el suelo
            createBoxParticles(box.x + box.width/2, box.y + box.height/2, box.color);
            game.boxes.splice(i, 1);
            continue;
        }
        
        // Eliminar cajas que salen de la pantalla por abajo
        if (box.y > canvas.height) {
            game.boxes.splice(i, 1);
        }
    }
}

// Actualizar partículas
function updateParticles(deltaTime) {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravedad para partículas
        particle.life -= deltaTime;
        
        if (particle.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

// Crear partículas para caja al tocar suelo
function createBoxParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        game.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            life: 1,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

// Crear partículas de muerte
function createDeathParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        game.particles.push({
            x: x + player.width/2,
            y: y + player.height/2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 4,
            life: 2,
            color: '#e74c3c',
            size: Math.random() * 4 + 2
        });
    }
}

// Crear nueva caja
function spawnBox() {
    const size = Math.random() * 30 + 25;
    const box = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        color: getRandomBoxColor()
    };
    game.boxes.push(box);
}

// Obtener color aleatorio para caja
function getRandomBoxColor() {
    const colors = ['#3498db', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Verificar colisiones
function checkCollisions() {
    for (let box of game.boxes) {
        if (checkCollision(player, box)) {
            startDeathAnimation();
            return;
        }
    }
}

// Iniciar animación de muerte
function startDeathAnimation() {
    game.gameOverAnimation = true;
    game.deathTimer = 0;
    createDeathParticles(player.x, player.y);
}

// Actualizar animación de muerte
function updateDeathAnimation(deltaTime) {
    game.deathTimer += deltaTime;
    
    // Actualizar partículas
    updateParticles(deltaTime);
    
    // Después de 2 segundos, mostrar game over
    if (game.deathTimer > 2) {
        gameOver();
    }
}

// Verificar colisión entre dos objetos
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Dibujar juego
function drawGame() {
    // Limpiar canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar suelo
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Dibujar patrón de grid
    drawGrid();
    
    // Dibujar cajas
    drawBoxes();
    
    // Dibujar partículas
    drawParticles();
    
    // Dibujar jugador (si no está en animación de muerte)
    if (!game.gameOverAnimation && (!player.isBlinking || Math.floor(game.deathTimer * 10) % 2 === 0)) {
        drawPlayer();
    }
    
    // Dibujar información del nivel
    drawHUD();
}

// Dibujar grid de fondo
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Dibujar cajas
function drawBoxes() {
    game.boxes.forEach(box => {
        // Sombra de la caja
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(box.x + 3, box.y + 3, box.width, box.height);
        
        // Caja principal
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, box.width, box.height);
        
        // Borde
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Detalles de la caja (líneas)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(box.x + 5, box.y + 5);
        ctx.lineTo(box.x + box.width - 5, box.y + 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(box.x + 5, box.y + 5);
        ctx.lineTo(box.x + 5, box.y + box.height - 5);
        ctx.stroke();
    });
}

// Dibujar partículas
function drawParticles() {
    game.particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(
            particle.x - particle.size/2,
            particle.y - particle.size/2,
            particle.size,
            particle.size
        );
    });
    ctx.globalAlpha = 1;
}

// Dibujar jugador MEJORADO
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const width = player.width;
    const height = player.height;
    
    // Sombra del jugador
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 2, y + 2, width, height);
    
    // Cuerpo del jugador (traje rojo con detalles)
    ctx.fillStyle = player.color;
    ctx.fillRect(x, y, width, height);
    
    // Chaleco azul
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x + 5, y + 10, width - 10, height - 25);
    
    // Botones del chaleco
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x + width/2 - 2, y + 20, 4, 4);
    ctx.fillRect(x + width/2 - 2, y + 30, 4, 4);
    
    // Borde del traje
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Cara (área blanca con más detalles)
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(x + 8, y + 8, width - 16, 18);
    
    // Ojos del jugador (con expresión)
    ctx.fillStyle = '#2c3e50';
    const eyeOffset = player.facing === 'right' ? 3 : -3;
    ctx.fillRect(x + 12 + eyeOffset, y + 14, 3, 3);
    ctx.fillRect(x + width - 16 + eyeOffset, y + 14, 3, 3);
    
    // Cejas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 10, y + 11, 8, 2);
    ctx.fillRect(x + width - 18, y + 11, 8, 2);
    
    // Boca (sonrisa o línea recta)
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (player.velocityX !== 0) {
        // Sonrisa cuando se mueve
        ctx.arc(x + width/2, y + 22, 5, 0.2, Math.PI - 0.2);
    } else {
        // Línea recta cuando está quieto
        ctx.moveTo(x + 15, y + 22);
        ctx.lineTo(x + width - 15, y + 22);
    }
    ctx.stroke();
    
    // Gorra con visera
    ctx.fillStyle = player.color;
    ctx.fillRect(x + 3, y, width - 6, 10);
    ctx.fillRect(x, y + 8, width, 4);
    
    // Visera de la gorra
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 5, y + 10, width - 10, 3);
    
    // Brazos con animación
    ctx.fillStyle = '#ffdbac';
    const armSwing = player.velocityX !== 0 ? Math.sin(Date.now() / 100) * 5 : 0;
    ctx.fillRect(x - 6, y + 12, 6, 10);
    ctx.fillRect(x + width, y + 12, 6, 10);
    
    // Manos
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(x - 8, y + 10, 4, 4);
    ctx.fillRect(x + width + 4, y + 10, 4, 4);
    
    // Piernas con pantalones
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x + 8, y + height - 15, 8, 15);
    ctx.fillRect(x + width - 16, y + height - 15, 8, 15);
    
    // Zapatos con cordones
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 5, y + height - 5, 14, 5);
    ctx.fillRect(x + width - 19, y + height - 5, 14, 5);
    
    // Cordones de los zapatos
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + height - 5);
    ctx.lineTo(x + 14, y + height - 1);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width - 14, y + height - 5);
    ctx.lineTo(x + width - 10, y + height - 1);
    ctx.stroke();
}

// Dibujar HUD
function drawHUD() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 150, 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`NIVEL: ${game.level}`, 20, 25);
    ctx.fillText(`TIEMPO: ${Math.ceil(game.timeLeft)}`, 20, 40);
}

// Game Over
function gameOver() {
    game.running = false;
    
    // Calcular estrellas
    let starsEarned = Math.min(game.level, 3);
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        }
    });
    
    // Actualizar highscore
    if (game.level > game.highscore) {
        game.highscore = game.level;
        localStorage.setItem('jumpboxes-highscore', game.highscore);
        highscoreElement.textContent = game.highscore;
    }
    
    // Guardar progreso
    saveProgress(starsEarned);
    
    // Mostrar pantalla de game over
    finalLevelElement.textContent = game.level;
    finalTimeElement.textContent = Math.ceil(levelConfig[game.level].time - game.timeLeft);
    earnedStarsElement.textContent = starsEarned;
    gameOverElement.style.display = 'block';
    
    cancelAnimationFrame(game.gameLoopId);
}

// Nivel completado
function levelComplete() {
    game.running = false;
    
    // Calcular estrellas
    let starsEarned = Math.min(game.level, 3);
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        }
    });
    
    // Actualizar highscore
    if (game.level > game.highscore) {
        game.highscore = game.level;
        localStorage.setItem('jumpboxes-highscore', game.highscore);
        highscoreElement.textContent = game.highscore;
    }
    
    // Guardar progreso
    saveProgress(starsEarned);
    
    // Mostrar pantalla de nivel completado
    nextLevelElement.textContent = game.level + 1;
    levelCompleteElement.style.display = 'block';
    
    cancelAnimationFrame(game.gameLoopId);
}

// Guardar progreso
function saveProgress(starsEarned) {
    const currentStars = parseInt(localStorage.getItem('jumpboxes-stars')) || 0;
    const newStars = Math.max(currentStars, starsEarned);
    localStorage.setItem('jumpboxes-stars', newStars);
    
    // Actualizar totales
    updateTotalProgress();
}

// Actualizar progreso total
function updateTotalProgress() {
    const games = ['snake', 'jumpboxes'];
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
// ninja-sombra.js - Juego de acción ninja (CÓDIGO CORREGIDO)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelElement = document.getElementById('level');
const livesElement = document.getElementById('lives');
const shurikensElement = document.getElementById('shurikens');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverElement = document.getElementById('gameOver');
const levelCompleteElement = document.getElementById('levelComplete');
const pausedScreen = document.getElementById('pausedScreen');
const finalLevelElement = document.getElementById('finalLevel');
const finalGuardsElement = document.getElementById('finalGuards');
const earnedStarsElement = document.getElementById('earnedStars');
const nextLevelElement = document.getElementById('nextLevel');
const startBtn = document.getElementById('startBtn');
const menuBtn = document.getElementById('menuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stars = document.querySelectorAll('.star');
const mobileBtns = document.querySelectorAll('.mobile-btn');

// Configuración del juego
const tileSize = 20;
const gravity = 0.5;
const jumpForce = -10;

// Variables del juego
let ninja = {
    x: 50,
    y: 300,
    width: 20,
    height: 30,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    doubleJump: false,
    stealth: false,
    facingRight: true,
    shurikens: 5
};

let guards = [];
let shurikens = [];
let platforms = [];
let level = 1;
let lives = 3;
let score = 0;
let gameRunning = false;
let gamePaused = false;
let keys = {};
let guardsEliminated = 0;
let gameLoopId = null;

// Colores
const colors = {
    background: '#0f3460',
    ninja: '#2c3e50',
    ninjaStealth: '#3498db',
    ninjaOutline: '#1a252f',
    guard: '#e74c3c',
    guardAlert: '#c0392b',
    guardOutline: '#7f1d1d',
    platform: '#8B4513',
    platformOutline: '#5D2906',
    shuriken: '#95a5a6',
    shurikenOutline: '#7f8c8d',
    vision: 'rgba(255, 255, 0, 0.1)',
    visionAlert: 'rgba(255, 0, 0, 0.2)'
};

// Inicializar el juego
function init() {
    console.log('Inicializando El Ninja Sombra...');
    
    // Configurar event listeners CORREGIDOS
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Botones CORREGIDOS
    startBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', goToMenu);
    playAgainBtn.addEventListener('click', resetGame);
    nextLevelBtn.addEventListener('click', nextLevel);
    resumeBtn.addEventListener('click', togglePause);
    
    // Controles móviles
    mobileBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-direction');
            handleMobileAction(action);
        });
    });
    
    resetGame();
    drawGame(); // Dibujar estado inicial
}

// Manejar teclas presionadas
function handleKeyDown(e) {
    keys[e.key] = true;
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            if (!gameRunning) {
                startGame();
            } else if (!gamePaused) {
                jump();
            }
            break;
        case 'z':
        case 'Z':
            if (gameRunning && !gamePaused) {
                throwShuriken();
            }
            break;
        case 'x':
        case 'X':
            if (gameRunning && !gamePaused) {
                ninja.stealth = true;
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
    
    switch(e.key) {
        case 'x':
        case 'X':
            ninja.stealth = false;
            break;
    }
}

// Manejar acciones móviles
function handleMobileAction(action) {
    if (gamePaused) return;
    
    if (!gameRunning && action === 'jump') {
        startGame();
    }
    
    switch(action) {
        case 'left':
            keys['ArrowLeft'] = true;
            setTimeout(() => { keys['ArrowLeft'] = false; }, 100);
            break;
        case 'right':
            keys['ArrowRight'] = true;
            setTimeout(() => { keys['ArrowRight'] = false; }, 100);
            break;
        case 'jump':
            jump();
            break;
        case 'shuriken':
            throwShuriken();
            break;
    }
}

// Iniciar el juego CORREGIDO
function startGame() {
    console.log('Iniciando juego...');
    gameRunning = true;
    startScreen.style.display = 'none';
    startGameLoop();
}

// Saltar
function jump() {
    if (!gameRunning || gamePaused) return;
    
    if (!ninja.jumping) {
        ninja.velY = jumpForce;
        ninja.jumping = true;
    } else if (!ninja.doubleJump) {
        ninja.velY = jumpForce * 0.8;
        ninja.doubleJump = true;
    }
}

// Lanzar shuriken
function throwShuriken() {
    if (!gameRunning || gamePaused || ninja.shurikens <= 0) return;
    
    shurikens.push({
        x: ninja.facingRight ? ninja.x + ninja.width : ninja.x,
        y: ninja.y + ninja.height / 2,
        width: 8,
        height: 8,
        speed: ninja.facingRight ? 8 : -8,
        active: true
    });
    
    ninja.shurikens--;
    updateUI();
}

// Pausar/Reanudar CORREGIDO
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pausedScreen.style.display = 'flex';
        cancelAnimationFrame(gameLoopId);
    } else {
        pausedScreen.style.display = 'none';
        startGameLoop();
    }
}

// Actualizar interfaz de usuario
function updateUI() {
    levelElement.textContent = level;
    livesElement.textContent = lives;
    shurikensElement.textContent = ninja.shurikens;
    scoreElement.textContent = score;
}

// Reiniciar juego CORREGIDO
function resetGame() {
    console.log('Reiniciando juego...');
    
    // Resetear variables
    level = 1;
    lives = 3;
    score = 0;
    guardsEliminated = 0;
    gameRunning = false;
    gamePaused = false;
    
    // Resetear ninja
    ninja.x = 50;
    ninja.y = 300;
    ninja.velX = 0;
    ninja.velY = 0;
    ninja.jumping = false;
    ninja.doubleJump = false;
    ninja.stealth = false;
    ninja.facingRight = true;
    ninja.shurikens = 5;
    
    // Limpiar arrays
    guards = [];
    shurikens = [];
    
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
    
    // Limpiar bucle anterior
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
}

// Configurar nivel
function setupLevel() {
    // Configurar plataformas
    platforms = [
        {x: 0, y: 430, width: 400, height: 20}, // Suelo
        {x: 50, y: 350, width: 100, height: 15},
        {x: 200, y: 300, width: 80, height: 15},
        {x: 100, y: 250, width: 120, height: 15},
        {x: 250, y: 200, width: 100, height: 15},
        {x: 50, y: 150, width: 80, height: 15},
        {x: 300, y: 100, width: 80, height: 15}
    ];
    
    // Configurar guardias según nivel
    guards = [];
    let guardCount = 2 + level;
    
    for (let i = 0; i < guardCount; i++) {
        guards.push({
            x: 100 + i * 80,
            y: 350,
            width: 20,
            height: 30,
            speed: 1 + level * 0.2,
            direction: i % 2 === 0 ? 1 : -1,
            visionRange: 120,
            alert: false,
            patrolMin: 50 + i * 70,
            patrolMax: 150 + i * 70,
            alive: true
        });
        
        // Ajustar posición Y según plataforma
        if (i % 3 === 0) guards[i].y = 250;
        if (i % 4 === 0) guards[i].y = 150;
    }
    
    // Resetear shurikens del ninja
    ninja.shurikens = 5 + level;
}

// Siguiente nivel CORREGIDO
function nextLevel() {
    level++;
    guardsEliminated = 0;
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
    gameLoop();
}

// Bucle principal del juego
function gameLoop() {
    if (!gameRunning || gamePaused) {
        return;
    }
    
    updateGame();
    drawGame();
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Actualizar estado del juego
function updateGame() {
    // Movimiento del ninja
    if (keys['ArrowLeft']) {
        ninja.velX = -ninja.speed;
        ninja.facingRight = false;
    } else if (keys['ArrowRight']) {
        ninja.velX = ninja.speed;
        ninja.facingRight = true;
    } else {
        ninja.velX = 0;
    }
    
    // Aplicar gravedad
    ninja.velY += gravity;
    
    // Actualizar posición del ninja
    ninja.x += ninja.velX;
    ninja.y += ninja.velY;
    
    // Limitar movimiento dentro del canvas
    if (ninja.x < 0) ninja.x = 0;
    if (ninja.x + ninja.width > canvas.width) ninja.x = canvas.width - ninja.width;
    if (ninja.y > canvas.height) {
        // Caer fuera de la pantalla - perder vida
        loseLife();
    }
    
    // Detección de colisión con plataformas
    let onGround = false;
    for (let platform of platforms) {
        if (checkCollision(ninja, platform)) {
            // Colisión vertical
            if (ninja.velY > 0 && ninja.y + ninja.height > platform.y && ninja.y < platform.y) {
                ninja.y = platform.y - ninja.height;
                ninja.velY = 0;
                ninja.jumping = false;
                ninja.doubleJump = false;
                onGround = true;
            }
            // Colisión horizontal
            else if (ninja.velX !== 0) {
                if (ninja.velX > 0 && ninja.x + ninja.width > platform.x && ninja.x < platform.x) {
                    ninja.x = platform.x - ninja.width;
                } else if (ninja.velX < 0 && ninja.x < platform.x + platform.width && ninja.x + ninja.width > platform.x + platform.width) {
                    ninja.x = platform.x + platform.width;
                }
            }
        }
    }
    
    // Actualizar guardias
    updateGuards();
    
    // Actualizar shurikens
    updateShurikens();
    
    // Verificar si todos los guardias fueron eliminados
    if (guards.every(guard => !guard.alive)) {
        levelComplete();
    }
}

// Actualizar guardias
function updateGuards() {
    for (let guard of guards) {
        if (!guard.alive) continue;
        
        // Movimiento de patrulla
        guard.x += guard.speed * guard.direction;
        
        // Cambiar dirección en límites de patrulla
        if (guard.x <= guard.patrolMin || guard.x + guard.width >= guard.patrolMax) {
            guard.direction *= -1;
        }
        
        // Detección del ninja
        guard.alert = false;
        if (!ninja.stealth) {
            const dx = ninja.x + ninja.width/2 - (guard.x + guard.width/2);
            const dy = ninja.y + ninja.height/2 - (guard.y + guard.height/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < guard.visionRange) {
                // Verificar si el ninja está en el campo de visión
                const angle = Math.atan2(dy, dx);
                const visionAngle = guard.direction === 1 ? 0 : Math.PI;
                const angleDiff = Math.abs(angle - visionAngle);
                
                if (angleDiff < Math.PI/3) { // 60 grados de visión
                    guard.alert = true;
                    
                    // Si está muy cerca, el ninja pierde una vida
                    if (distance < 30) {
                        loseLife();
                    }
                }
            }
        }
    }
}

// Actualizar shurikens
function updateShurikens() {
    for (let i = shurikens.length - 1; i >= 0; i--) {
        const shuriken = shurikens[i];
        
        // Mover shuriken
        shuriken.x += shuriken.speed;
        
        // Verificar colisión con guardias
        for (let j = 0; j < guards.length; j++) {
            const guard = guards[j];
            if (guard.alive && checkCollision(shuriken, guard)) {
                // Eliminar guardia
                guard.alive = false;
                guardsEliminated++;
                score += 100;
                updateUI();
                
                // Eliminar shuriken
                shurikens.splice(i, 1);
                break;
            }
        }
        
        // Eliminar shuriken si sale de la pantalla
        if (shuriken.x < 0 || shuriken.x > canvas.width) {
            shurikens.splice(i, 1);
        }
    }
}

// Verificar colisión entre dos objetos
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Perder vida
function loseLife() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Reposicionar ninja
        ninja.x = 50;
        ninja.y = 300;
        ninja.velX = 0;
        ninja.velY = 0;
        ninja.jumping = false;
        ninja.doubleJump = false;
    }
}

// Game Over CORREGIDO
function gameOver() {
    console.log('Game Over!');
    
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
    
    // Calcular estrellas
    let starsEarned = 0;
    if (level >= 3) starsEarned = 3;
    else if (level >= 2) starsEarned = 2;
    else if (level >= 1) starsEarned = 1;
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
        }
    });
    
    // Guardar progreso
    saveProgress(starsEarned);
    
    // Mostrar pantalla de game over
    finalLevelElement.textContent = level;
    finalGuardsElement.textContent = guardsEliminated;
    earnedStarsElement.textContent = starsEarned;
    gameOverElement.style.display = 'flex';
}

// Completar nivel CORREGIDO
function levelComplete() {
    console.log('Nivel completado!');
    
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
    
    // Calcular estrellas
    let starsEarned = Math.min(3, Math.floor(guardsEliminated / 2) + 1);
    
    // Mostrar estrellas
    stars.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.add('active');
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
    const currentLevel = parseInt(localStorage.getItem('ninja-sombra-highscore')) || 0;
    const newLevel = Math.max(currentLevel, level);
    localStorage.setItem('ninja-sombra-highscore', newLevel);
    
    const currentStars = parseInt(localStorage.getItem('ninja-sombra-stars')) || 0;
    const newStars = currentStars + starsEarned;
    localStorage.setItem('ninja-sombra-stars', newStars);
}

// Volver al menú CORREGIDO
function goToMenu() {
    // Si estamos en una ventana hija, cerrarla
    if (window.location !== window.parent.location) {
        window.close();
    } else {
        // Intentar volver al index.html
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        window.location.href = basePath ? basePath + '/index.html' : 'index.html';
    }
}

// Dibujar juego
function drawGame() {
    // Limpiar canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar plataformas
    drawPlatforms();
    
    // Dibujar guardias
    drawGuards();
    
    // Dibujar shurikens
    drawShurikens();
    
    // Dibujar ninja
    drawNinja();
}

// Dibujar plataformas
function drawPlatforms() {
    ctx.fillStyle = colors.platform;
    ctx.strokeStyle = colors.platformOutline;
    ctx.lineWidth = 2;
    
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
}

// Dibujar guardias
function drawGuards() {
    for (let guard of guards) {
        if (!guard.alive) continue;
        
        // Cuerpo del guardia
        ctx.fillStyle = guard.alert ? colors.guardAlert : colors.guard;
        ctx.fillRect(guard.x, guard.y, guard.width, guard.height);
        
        // Cabeza
        ctx.fillStyle = guard.alert ? '#922b21' : '#7f1d1d';
        ctx.fillRect(guard.x + 5, guard.y - 10, 10, 10);
        
        // Campo de visión
        ctx.fillStyle = guard.alert ? colors.visionAlert : colors.vision;
        ctx.beginPath();
        ctx.moveTo(guard.x + guard.width / 2, guard.y);
        ctx.arc(guard.x + guard.width / 2, guard.y, guard.visionRange, 
                guard.direction === 1 ? -Math.PI/3 : Math.PI*2/3, 
                guard.direction === 1 ? Math.PI/3 : Math.PI*4/3);
        ctx.closePath();
        ctx.fill();
    }
}

// Dibujar shurikens
function drawShurikens() {
    ctx.fillStyle = colors.shuriken;
    ctx.strokeStyle = colors.shurikenOutline;
    ctx.lineWidth = 1;
    
    for (let shuriken of shurikens) {
        ctx.beginPath();
        ctx.arc(shuriken.x, shuriken.y, shuriken.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Puntas del shuriken
        ctx.beginPath();
        ctx.moveTo(shuriken.x - 6, shuriken.y);
        ctx.lineTo(shuriken.x + 6, shuriken.y);
        ctx.moveTo(shuriken.x, shuriken.y - 6);
        ctx.lineTo(shuriken.x, shuriken.y + 6);
        ctx.stroke();
    }
}

// Dibujar ninja
function drawNinja() {
    // Cuerpo del ninja
    ctx.fillStyle = ninja.stealth ? colors.ninjaStealth : colors.ninja;
    ctx.fillRect(ninja.x, ninja.y, ninja.width, ninja.height);
    
    // Cabeza
    ctx.fillStyle = ninja.stealth ? '#2980b9' : '#1a252f';
    ctx.fillRect(ninja.x + 5, ninja.y - 8, 10, 8);
    
    // Borde
    ctx.strokeStyle = colors.ninjaOutline;
    ctx.lineWidth = 1;
    ctx.strokeRect(ninja.x, ninja.y, ninja.width, ninja.height);
    
    // Ojos (dependiendo de la dirección)
    ctx.fillStyle = '#ecf0f1';
    if (ninja.facingRight) {
        ctx.fillRect(ninja.x + 15, ninja.y + 8, 3, 3);
    } else {
        ctx.fillRect(ninja.x + 2, ninja.y + 8, 3, 3);
    }
    
    // Indicador de sigilo
    if (ninja.stealth) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.beginPath();
        ctx.arc(ninja.x + ninja.width/2, ninja.y + ninja.height/2, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Iniciar cuando se carga la página
window.addEventListener('load', init);
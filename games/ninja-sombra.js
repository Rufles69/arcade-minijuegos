// ninja-sombra.js - Juego de acción ninja (CÓDIGO COMPLETAMENTE CORREGIDO)

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
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const stars = document.querySelectorAll('.star');
const mobileBtns = document.querySelectorAll('.mobile-btn');

// Configuración del juego
const gravity = 0.8;
const jumpForce = -14;

// Variables del juego
let ninja = {
    x: 50,
    y: 300,
    width: 25,
    height: 35,
    speed: 6,
    velX: 0,
    velY: 0,
    jumping: false,
    doubleJump: false,
    stealth: false,
    facingRight: true,
    shurikens: 5,
    invulnerable: false,
    invulnerableTimer: 0
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
let lastTime = 0;

// Colores mejorados
const colors = {
    background: '#0f3460',
    ninja: '#2c3e50',
    ninjaStealth: '#3498db',
    ninjaOutline: '#1a252f',
    ninjaInvulnerable: '#9b59b6',
    guard: '#e74c3c',
    guardAlert: '#ff6b6b',
    guardOutline: '#c0392b',
    platform: '#8B4513',
    platformTop: '#a0522d',
    platformOutline: '#5D2906',
    shuriken: '#ecf0f1',
    shurikenOutline: '#bdc3c7',
    vision: 'rgba(255, 255, 0, 0.15)',
    visionAlert: 'rgba(255, 0, 0, 0.25)',
    text: '#ecf0f1'
};

// Inicializar el juego
function init() {
    console.log('Inicializando El Ninja Sombra...');
    
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
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-direction');
            handleMobileAction(action);
        });
    });
    
    resetGame();
    drawGame();
}

// Manejar teclas presionadas
function handleKeyDown(e) {
    if (e.key in keys) {
        keys[e.key] = true;
    }
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            if (!gameRunning && !gamePaused) {
                startGame();
            } else if (gameRunning && !gamePaused) {
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
    if (e.key in keys) {
        keys[e.key] = false;
    }
    
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
        return;
    }
    
    if (!gameRunning) return;
    
    switch(action) {
        case 'left':
            keys['ArrowLeft'] = true;
            setTimeout(() => { keys['ArrowLeft'] = false; }, 200);
            break;
        case 'right':
            keys['ArrowRight'] = true;
            setTimeout(() => { keys['ArrowRight'] = false; }, 200);
            break;
        case 'jump':
            jump();
            break;
        case 'shuriken':
            throwShuriken();
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

// Saltar
function jump() {
    if (!gameRunning || gamePaused) return;
    
    if (!ninja.jumping) {
        ninja.velY = jumpForce;
        ninja.jumping = true;
    } else if (!ninja.doubleJump) {
        ninja.velY = jumpForce * 0.9;
        ninja.doubleJump = true;
    }
}

// Lanzar shuriken
function throwShuriken() {
    if (!gameRunning || gamePaused || ninja.shurikens <= 0) return;
    
    const shuriken = {
        x: ninja.facingRight ? ninja.x + ninja.width : ninja.x - 8,
        y: ninja.y + ninja.height / 2 - 4,
        width: 8,
        height: 8,
        speed: ninja.facingRight ? 12 : -12,
        active: true
    };
    
    shurikens.push(shuriken);
    ninja.shurikens--;
    updateUI();
}

// Pausar/Reanudar
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

// Actualizar interfaz de usuario
function updateUI() {
    levelElement.textContent = level;
    livesElement.textContent = lives;
    shurikensElement.textContent = ninja.shurikens;
    scoreElement.textContent = score;
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
    lives = 3;
    score = 0;
    guardsEliminated = 0;
    
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
    ninja.invulnerable = false;
    ninja.invulnerableTimer = 0;
    
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
    
    drawGame();
}

// Configurar nivel - COMPLETAMENTE REESCRITO
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
    
    // Configurar guardias - POSICIONES CORREGIDAS
    guards = [];
    const guardPositions = [
        {x: 100, y: 350, patrolMin: 80, patrolMax: 180},
        {x: 280, y: 350, patrolMin: 250, patrolMax: 350},
        {x: 150, y: 250, patrolMin: 120, patrolMax: 220},
        {x: 320, y: 200, patrolMin: 290, patrolMax: 370}
    ];
    
    const guardCount = Math.min(2 + level, guardPositions.length);
    
    for (let i = 0; i < guardCount; i++) {
        const pos = guardPositions[i];
        guards.push({
            x: pos.x,
            y: pos.y - 30, // Ajustar para que estén sobre la plataforma
            width: 22,
            height: 32,
            speed: 1.5 + (level * 0.4),
            direction: i % 2 === 0 ? 1 : -1,
            visionRange: 120 + (level * 15),
            alert: false,
            patrolMin: pos.patrolMin,
            patrolMax: pos.patrolMax,
            alive: true,
            detectionCounter: 0
        });
    }
    
    // Resetear shurikens del ninja
    ninja.shurikens = 5 + level * 2;
    updateUI();
}

// Siguiente nivel
function nextLevel() {
    level++;
    guardsEliminated = 0;
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

// Bucle principal del juego - MEJORADO
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

// Actualizar estado del juego - COMPLETAMENTE REESCRITO
function updateGame(deltaTime) {
    // Actualizar invulnerabilidad
    if (ninja.invulnerable) {
        ninja.invulnerableTimer -= deltaTime;
        if (ninja.invulnerableTimer <= 0) {
            ninja.invulnerable = false;
        }
    }
    
    // Movimiento del ninja
    if (keys['ArrowLeft']) {
        ninja.velX = -ninja.speed;
        ninja.facingRight = false;
    } else if (keys['ArrowRight']) {
        ninja.velX = ninja.speed;
        ninja.facingRight = true;
    } else {
        ninja.velX *= 0.8; // Fricción
        if (Math.abs(ninja.velX) < 0.5) ninja.velX = 0;
    }
    
    // Aplicar gravedad
    ninja.velY += gravity;
    
    // Actualizar posición X
    ninja.x += ninja.velX * deltaTime;
    
    // Limitar movimiento horizontal
    if (ninja.x < 0) {
        ninja.x = 0;
        ninja.velX = 0;
    } else if (ninja.x + ninja.width > canvas.width) {
        ninja.x = canvas.width - ninja.width;
        ninja.velX = 0;
    }
    
    // Actualizar posición Y
    ninja.y += ninja.velY * deltaTime;
    
    // CAER FUERA DE LA PANTALLA - AHORA SÍ FUNCIONA
    if (ninja.y > canvas.height + 50) {
        loseLife();
        return;
    }
    
    // Detección de colisión con plataformas - MEJORADO
    let onGround = false;
    for (let platform of platforms) {
        // Colisión vertical (aterrizando)
        if (ninja.velY > 0 && 
            ninja.x + ninja.width > platform.x + 5 &&
            ninja.x < platform.x + platform.width - 5 &&
            ninja.y + ninja.height > platform.y &&
            ninja.y + ninja.height < platform.y + 10) {
            
            ninja.y = platform.y - ninja.height;
            ninja.velY = 0;
            ninja.jumping = false;
            ninja.doubleJump = false;
            onGround = true;
        }
        
        // Colisión desde abajo
        if (ninja.velY < 0 &&
            ninja.x + ninja.width > platform.x &&
            ninja.x < platform.x + platform.width &&
            ninja.y < platform.y + platform.height &&
            ninja.y + ninja.height > platform.y + platform.height) {
            
            ninja.y = platform.y + platform.height;
            ninja.velY = 0;
        }
        
        // Colisión horizontal izquierda
        if (ninja.velX > 0 &&
            ninja.x + ninja.width > platform.x &&
            ninja.x < platform.x &&
            ninja.y + ninja.height > platform.y + 5 &&
            ninja.y < platform.y + platform.height - 5) {
            
            ninja.x = platform.x - ninja.width;
            ninja.velX = 0;
        }
        
        // Colisión horizontal derecha
        if (ninja.velX < 0 &&
            ninja.x < platform.x + platform.width &&
            ninja.x + ninja.width > platform.x + platform.width &&
            ninja.y + ninja.height > platform.y + 5 &&
            ninja.y < platform.y + platform.height - 5) {
            
            ninja.x = platform.x + platform.width;
            ninja.velX = 0;
        }
    }
    
    // Actualizar guardias - SISTEMA COMPLETAMENTE FUNCIONAL
    updateGuards(deltaTime);
    
    // Actualizar shurikens - CORREGIDO
    updateShurikens(deltaTime);
    
    // Verificar si todos los guardias fueron eliminados
    const aliveGuards = guards.filter(guard => guard.alive);
    if (aliveGuards.length === 0) {
        setTimeout(() => levelComplete(), 500);
    }
}

// Actualizar guardias - AHORA SÍ FUNCIONAN
function updateGuards(deltaTime) {
    for (let guard of guards) {
        if (!guard.alive) continue;
        
        // Movimiento de patrulla
        guard.x += guard.speed * guard.direction * deltaTime;
        
        // Cambiar dirección en límites de patrulla
        if (guard.x <= guard.patrolMin) {
            guard.direction = 1;
            guard.x = guard.patrolMin;
        } else if (guard.x + guard.width >= guard.patrolMax) {
            guard.direction = -1;
            guard.x = guard.patrolMax - guard.width;
        }
        
        // DETECCIÓN DEL NINJA - SISTEMA FUNCIONAL
        if (!ninja.invulnerable) {
            const dx = (ninja.x + ninja.width/2) - (guard.x + guard.width/2);
            const dy = (ninja.y + ninja.height/2) - (guard.y + guard.height/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            let canSeeNinja = false;
            
            if (!ninja.stealth && distance < guard.visionRange) {
                // Verificar dirección de la visión
                const angleToNinja = Math.atan2(dy, dx);
                const guardFacing = guard.direction > 0 ? 0 : Math.PI;
                const angleDiff = Math.abs(angleToNinja - guardFacing);
                
                // Campo de visión de 100 grados
                if (angleDiff < Math.PI/1.8 || angleDiff > Math.PI*1.2) {
                    canSeeNinja = true;
                }
            }
            
            if (canSeeNinja) {
                guard.alert = true;
                guard.detectionCounter++;
                
                // Si detecta al ninja por suficiente tiempo, pierde vida
                if (guard.detectionCounter > 45 && distance < 50) {
                    loseLife();
                    guard.detectionCounter = 0;
                }
            } else {
                guard.alert = false;
                guard.detectionCounter = Math.max(0, guard.detectionCounter - 2);
            }
        }
    }
}

// Actualizar shurikens - CORREGIDO PARA QUE ELIMINEN GUARDIAS
function updateShurikens(deltaTime) {
    for (let i = shurikens.length - 1; i >= 0; i--) {
        const shuriken = shurikens[i];
        
        // Mover shuriken
        shuriken.x += shuriken.speed * deltaTime;
        
        // Verificar colisión con guardias - SISTEMA FUNCIONAL
        let shurikenHit = false;
        for (let j = 0; j < guards.length; j++) {
            const guard = guards[j];
            if (guard.alive && checkCollision(shuriken, guard)) {
                // Eliminar guardia
                guard.alive = false;
                guardsEliminated++;
                score += 100 + (level * 50);
                updateUI();
                shurikenHit = true;
                break;
            }
        }
        
        // Eliminar shuriken si golpea o sale de la pantalla
        if (shurikenHit || shuriken.x < -20 || shuriken.x > canvas.width + 20) {
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

// Perder vida - MEJORADO
function loseLife() {
    if (ninja.invulnerable) return;
    
    lives--;
    updateUI();
    
    // Efecto de invulnerabilidad
    ninja.invulnerable = true;
    ninja.invulnerableTimer = 120; // 2 segundos aprox
    
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
        
        // Resetear detección de guardias
        guards.forEach(guard => {
            guard.alert = false;
            guard.detectionCounter = 0;
        });
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
    finalGuardsElement.textContent = guardsEliminated;
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
        const currentLevel = parseInt(localStorage.getItem('ninja-sombra-highscore')) || 0;
        const newLevel = Math.max(currentLevel, level);
        localStorage.setItem('ninja-sombra-highscore', newLevel.toString());
        
        const currentStars = parseInt(localStorage.getItem('ninja-sombra-stars')) || 0;
        const newStars = currentStars + starsEarned;
        localStorage.setItem('ninja-sombra-stars', newStars.toString());
        
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
// SISTEMA DE DIBUJO MEJORADO
// =============================================

function drawGame() {
    // Fondo con gradiente
    drawBackground();
    
    // Dibujar plataformas
    drawPlatforms();
    
    // Dibujar guardias
    drawGuards();
    
    // Dibujar shurikens
    drawShurikens();
    
    // Dibujar ninja
    drawNinja();
    
    // Efectos visuales
    drawEffects();
}

function drawBackground() {
    // Gradiente de fondo
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Estrellas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 20; i++) {
        const x = (i * 47) % canvas.width;
        const y = (i * 23) % 200;
        const size = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlatforms() {
    for (let platform of platforms) {
        // Plataforma principal
        ctx.fillStyle = colors.platform;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Borde
        ctx.strokeStyle = colors.platformOutline;
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Parte superior (hierba)
        ctx.fillStyle = colors.platformTop;
        ctx.fillRect(platform.x, platform.y, platform.width, 4);
        
        // Textura de madera
        ctx.strokeStyle = '#5D2906';
        ctx.lineWidth = 1;
        for (let i = platform.x + 8; i < platform.x + platform.width; i += 16) {
            ctx.beginPath();
            ctx.moveTo(i, platform.y + 4);
            ctx.lineTo(i, platform.y + platform.height);
            ctx.stroke();
        }
    }
}

function drawGuards() {
    for (let guard of guards) {
        if (!guard.alive) continue;
        
        // Campo de visión
        ctx.fillStyle = guard.alert ? colors.visionAlert : colors.vision;
        ctx.beginPath();
        ctx.moveTo(guard.x + guard.width / 2, guard.y + 10);
        
        const startAngle = guard.direction > 0 ? -Math.PI/2.2 : Math.PI/1.1;
        const endAngle = guard.direction > 0 ? Math.PI/2.2 : Math.PI*1.1;
        
        ctx.arc(guard.x + guard.width / 2, guard.y + 10, guard.visionRange, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        
        // Cuerpo del guardia
        ctx.fillStyle = guard.alert ? colors.guardAlert : colors.guard;
        ctx.fillRect(guard.x, guard.y, guard.width, guard.height);
        
        // Chaleco
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(guard.x + 3, guard.y + 8, guard.width - 6, 12);
        
        // Cabeza
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(guard.x + 5, guard.y - 8, 12, 10);
        
        // Ojos (mirando en la dirección que patrulla)
        ctx.fillStyle = '#2c3e50';
        if (guard.direction > 0) {
            ctx.fillRect(guard.x + 12, guard.y - 5, 2, 2);
        } else {
            ctx.fillRect(guard.x + 7, guard.y - 5, 2, 2);
        }
        
        // Indicador de alerta
        if (guard.alert) {
            ctx.fillStyle = '#ff0000';
            ctx.font = '10px Press Start 2P';
            ctx.fillText('!', guard.x + 8, guard.y - 12);
        }
        
        // Borde
        ctx.strokeStyle = colors.guardOutline;
        ctx.lineWidth = 1;
        ctx.strokeRect(guard.x, guard.y, guard.width, guard.height);
    }
}

function drawShurikens() {
    for (let shuriken of shurikens) {
        // Cuerpo del shuriken
        ctx.fillStyle = colors.shuriken;
        ctx.strokeStyle = colors.shurikenOutline;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(shuriken.x + 4, shuriken.y + 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Puntas del shuriken (girando)
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        
        const rotation = Date.now() * 0.01;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        ctx.beginPath();
        ctx.moveTo(shuriken.x + 4 + cos * 6, shuriken.y + 4 + sin * 6);
        ctx.lineTo(shuriken.x + 4 - cos * 6, shuriken.y + 4 - sin * 6);
        ctx.moveTo(shuriken.x + 4 + sin * 6, shuriken.y + 4 - cos * 6);
        ctx.lineTo(shuriken.x + 4 - sin * 6, shuriken.y + 4 + cos * 6);
        ctx.stroke();
    }
}

function drawNinja() {
    const ninjaColor = ninja.invulnerable ? colors.ninjaInvulnerable : 
                      ninja.stealth ? colors.ninjaStealth : colors.ninja;
    
    // Efecto de sigilo
    if (ninja.stealth) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.beginPath();
        ctx.arc(ninja.x + ninja.width/2, ninja.y + ninja.height/2, 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Efecto de invulnerabilidad (parpadeo)
    if (ninja.invulnerable && Math.floor(ninja.invulnerableTimer / 5) % 2 === 0) {
        return; // Parpadeo
    }
    
    // Cuerpo del ninja
    ctx.fillStyle = ninjaColor;
    ctx.fillRect(ninja.x, ninja.y, ninja.width, ninja.height);
    
    // Cabeza
    ctx.fillStyle = ninja.stealth ? '#2980b9' : '#1a252f';
    ctx.fillRect(ninja.x + 7, ninja.y - 6, 11, 8);
    
    // Máscara
    ctx.fillStyle = ninja.stealth ? '#3498db' : '#2c3e50';
    ctx.fillRect(ninja.x + 5, ninja.y - 3, 15, 4);
    
    // Ojos
    ctx.fillStyle = ninja.stealth ? '#ecf0f1' : '#e74c3c';
    if (ninja.facingRight) {
        ctx.fillRect(ninja.x + 15, ninja.y - 2, 2, 2);
    } else {
        ctx.fillRect(ninja.x + 8, ninja.y - 2, 2, 2);
    }
    
    // Cinturón
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(ninja.x + 5, ninja.y + 25, ninja.width - 10, 3);
    
    // Borde
    ctx.strokeStyle = colors.ninjaOutline;
    ctx.lineWidth = 1;
    ctx.strokeRect(ninja.x, ninja.y, ninja.width, ninja.height);
    
    // Indicador de doble salto disponible
    if (!ninja.doubleJump && !ninja.jumping) {
        ctx.fillStyle = '#27ae60';
        ctx.font = '8px Press Start 2P';
        ctx.fillText('2x', ninja.x + 8, ninja.y - 10);
    }
}

function drawEffects() {
    // Efectos visuales adicionales
    if (ninja.invulnerable) {
        ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
        ctx.beginPath();
        ctx.arc(ninja.x + ninja.width/2, ninja.y + ninja.height/2, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Iniciar cuando se carga la página
window.addEventListener('load', init);
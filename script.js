// script.js - Navegación y gestión del progreso

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    loadProgress();
    
    // Configurar eventos para los juegos
    setupGameCards();
});

function setupGameCards() {
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameName = this.getAttribute('data-game');
            openGame(gameName);
        });
    });
}

function openGame(gameName) {
    // Abrir el juego en una nueva pestaña
    window.open(`games/${gameName}.html`, '_blank');
    
    // O si prefieres abrirlo en la misma página:
    // window.location.href = `games/${gameName}.html`;
}

function loadProgress() {
    // Cargar puntuaciones desde localStorage
    const totalPoints = localStorage.getItem('totalPoints') || 0;
    const totalStars = localStorage.getItem('totalStars') || 0;
    
    document.getElementById('totalPoints').textContent = totalPoints;
    document.getElementById('totalStars').textContent = totalStars;
    
    // Cargar puntuaciones específicas de cada juego
    const games = ['snake']; // Añadir otros juegos aquí
    
    games.forEach(game => {
        const highscore = localStorage.getItem(`${game}-highscore`) || 0;
        const stars = localStorage.getItem(`${game}-stars`) || 0;
        
        const highscoreElement = document.getElementById(`${game}-highscore`);
        const starsElement = document.getElementById(`${game}-stars`);
        
        if (highscoreElement) highscoreElement.textContent = highscore;
        if (starsElement) starsElement.textContent = stars;
    });
}

// Función para actualizar el progreso (será llamada desde los juegos)
function updateProgress(gameName, score, stars) {
    // Actualizar puntuación del juego
    const currentHighscore = parseInt(localStorage.getItem(`${gameName}-highscore`) || 0);
    if (score > currentHighscore) {
        localStorage.setItem(`${gameName}-highscore`, score);
    }
    
    // Actualizar estrellas del juego
    const currentStars = parseInt(localStorage.getItem(`${gameName}-stars`) || 0);
    const newStars = Math.max(currentStars, stars);
    localStorage.setItem(`${gameName}-stars`, newStars);
    
    // Actualizar totales
    updateTotals();
    
    // Recargar la visualización
    loadProgress();
}

function updateTotals() {
    // Calcular puntos totales sumando todos los highscores
    const games = ['snake']; // Añadir otros juegos aquí
    let totalPoints = 0;
    let totalStars = 0;
    
    games.forEach(game => {
        totalPoints += parseInt(localStorage.getItem(`${game}-highscore`) || 0);
        totalStars += parseInt(localStorage.getItem(`${game}-stars`) || 0);
    });
    
    localStorage.setItem('totalPoints', totalPoints);
    localStorage.setItem('totalStars', totalStars);
}
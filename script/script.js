const playButton = document.getElementById('playButton');
const player = document.getElementById('player');
const yoshis = document.querySelectorAll('.enemies');
const timerElement = document.getElementById('timer');
const livesElement = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const messageText = document.getElementById('messageText');
const resetButton = document.getElementById('resetButton');
const canvas = document.getElementById('canvas'); 
const easyMode = document.getElementById('easyButton');
const mediumMode = document.getElementById('mediumButton');
const hardMode = document.getElementById('hardButton');
const pauseButton = document.getElementById('pauseButton');

let gamePaused = false;
let playerLives = 3;
let gameDuration = 30; 
let gameInterval;
let yoshisMovingInterval;
let gameActive = false;

const yoshiHitStatus = new Map();
const yoshiDirections = new Map();

playButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
pauseButton.addEventListener('click', togglePause);

let difficultyMultiplier = null;

easyMode.addEventListener('click', () => setDifficulty(1));
mediumMode.addEventListener('click', () => setDifficulty(1.5));
hardMode.addEventListener('click', () => setDifficulty(2));

function setDifficulty(multiplier) {
    difficultyMultiplier = multiplier;
    document.querySelectorAll('button').forEach(btn => btn.style.backgroundColor = '');
    event.target.style.backgroundColor = 'lightslategrey';
}

function getRandomDirection() {
    return (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1 + 0.5) * difficultyMultiplier;
}

function startGame() {
    if (difficultyMultiplier === null) {
        alert('Please select a difficulty level!');
        return;
    }

    overlay.style.display = 'none';
    playButton.style.display = 'none';
    easyMode.style.display = 'none';
    mediumMode.style.display = 'none';
    hardMode.style.display = 'none';
    pauseButton.style.display = 'inline-block';


    playerLives = 3;
    gameDuration = 30;
    livesElement.textContent = `Lives: ${playerLives}`;
    timerElement.textContent = `Time left: ${gameDuration} seconds`;
    gameActive = true;


    // Display player and Yoshis only when we press play
    player.style.display = 'block';
    yoshis.forEach(yoshi => {
        yoshi.style.display = 'block';
    });

    player.style.top = '50%';
    player.style.left = '50%';
    player.style.transform = 'translate(-50%, -50%)';

    yoshis.forEach(yoshi => {
        yoshi.style.top = `${Math.random() * (canvas.clientHeight - yoshi.clientHeight)}px`;
        yoshi.style.left = `${Math.random() * (canvas.clientWidth - yoshi.clientWidth)}px`;
        yoshiHitStatus.set(yoshi, false);
        yoshiDirections.set(yoshi, { x: getRandomDirection(), y: getRandomDirection() });
    });

    gameInterval = setInterval(updateTimer, 1000);
    yoshisMovingInterval = setInterval(moveYoshis, 1000 / 60);

    document.addEventListener('keydown', movePlayer);
}

function updateTimer() {
    gameDuration--;
    timerElement.textContent = `Time left: ${gameDuration} seconds`;

    if (gameDuration <= 0) {
        endGame(true);
    }
}

function movePlayer(event) {
    if (!gameActive) return;

    const playerRect = player.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    switch(event.key) {
        case 'ArrowUp':
            if (playerRect.top > canvasRect.top) {
                player.style.top = `${player.offsetTop - 10}px`;
            }
            break;
        case 'ArrowDown':
            if (playerRect.bottom < canvasRect.bottom) {
                player.style.top = `${player.offsetTop + 10}px`;
            }
            break;
        case 'ArrowLeft':
            if (playerRect.left > canvasRect.left) {
                player.style.left = `${player.offsetLeft - 10}px`;
            }
            break;
        case 'ArrowRight':
            if (playerRect.right < canvasRect.right) {
                player.style.left = `${player.offsetLeft + 10}px`;
            }
            break;
    }
    
    checkCollision();
}

function moveYoshis() {
        yoshis.forEach(yoshi => {
            const direction = yoshiDirections.get(yoshi);
    
            let newLeft = yoshi.offsetLeft + direction.x;
            let newTop = yoshi.offsetTop + direction.y;
    
            if (newLeft <= 0 || newLeft >= canvas.clientWidth - yoshi.clientWidth) {
                direction.x *= -1;
                newLeft = yoshi.offsetLeft + direction.x;
            }
            if (newTop <= 0 || newTop >= canvas.clientHeight - yoshi.clientHeight) {
                direction.y *= -1;
                newTop = yoshi.offsetTop + direction.y;
            }
    
            yoshi.style.left = `${newLeft}px`;
            yoshi.style.top = `${newTop}px`;
        });
    
        checkCollision();  
    }

function checkCollision() {
    const playerRect = player.getBoundingClientRect();

    yoshis.forEach(yoshi => {
        const yoshiRect = yoshi.getBoundingClientRect();

        if (
            playerRect.left < yoshiRect.right &&
            playerRect.right > yoshiRect.left &&
            playerRect.top < yoshiRect.bottom &&
            playerRect.bottom > yoshiRect.top
        ) {
            if (!yoshiHitStatus.get(yoshi)) {
                playerLives--;
                livesElement.textContent = `Lives: ${playerLives}`;
                yoshiHitStatus.set(yoshi, true);

                flashPlayerRed();

                if (playerLives <= 0) {
                    endGame(false);
                }

                setTimeout(() => {
                    yoshiHitStatus.set(yoshi, false);
                }, 500);
            }
        }
    });
}

function flashPlayerRed() {
    player.style.filter = 'brightness(1.5) saturate(2) drop-shadow(0 0 15px red)';
    setTimeout(() => {
        player.style.filter = '';
    }, 200);
}

function endGame(win) {
    clearInterval(gameInterval);
    clearInterval(yoshisMovingInterval);
    gameActive = false;

    document.removeEventListener('keydown', movePlayer);

    setTimeout(() => {
        overlay.style.display = 'flex';
        messageText.textContent = win ? 'Yatta ne!' : 'Oh no!';
    }, 200); 
}


function resetGame() {
    overlay.style.display = 'none';
    playButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
    easyMode.style.display = 'inline-block';
    mediumMode.style.display = 'inline-block';
    hardMode.style.display = 'inline-block';
}

function togglePause() {
    if (gamePaused) {
        gameInterval = setInterval(updateTimer, 1000);
        yoshisMovingInterval = setInterval(moveYoshis, 1000 / 60);
        document.addEventListener('keydown', movePlayer);
        pauseButton.textContent = 'Pause';
        gamePaused = false;
    } else {
        clearInterval(gameInterval);
        clearInterval(yoshisMovingInterval);
        document.removeEventListener('keydown', movePlayer);
        pauseButton.textContent = 'Resume';
        gamePaused = true;
    }
}
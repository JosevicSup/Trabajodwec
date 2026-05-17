<template>
  <div class="snake-container">
    <header class="game-header">
      <h1 class="game-title">Neo Snake 🐍</h1>
    </header>

    <!-- Panel de Puntuación Premium -->
    <div class="score-board">
      <div class="score-item">
        <span class="label">PUNTOS</span>
        <span class="value">{{ score }}</span>
      </div>
      <div class="score-item">
        <span class="label">RECORD 🏆</span>
        <span class="value">{{ highScore }}</span>
      </div>
      <div class="score-item">
        <span class="label">NIVEL</span>
        <span class="value">{{ level }}</span>
      </div>
      <div class="score-item">
        <span class="label">VELOCIDAD</span>
        <span class="value">{{ speedDisplay }}%</span>
      </div>
    </div>

    <!-- Canvas de Juego -->
    <div class="canvas-wrapper">
      <canvas 
        ref="gameCanvas" 
        width="400" 
        height="400" 
        class="game-canvas"
      ></canvas>

      <!-- Superposición: Fin de Juego -->
      <div v-if="gameState === 'gameover'" class="overlay gameover-overlay">
        <h2 class="text-red">FIN DE JUEGO</h2>
        
        <div class="stats-summary">
          <p>Puntuación Final: <span class="highlight">{{ score }}</span></p>
          <p v-if="newHighScore" class="new-record-banner">🎉 ¡NUEVO RÉCORD BATIDO! 🎉</p>
          <p>Nivel alcanzado: <span class="highlight">{{ level }}</span></p>
        </div>

        <button class="primary-btn" @click="resetToMenu">Volver al Menú</button>
      </div>

      <!-- Superposición: Menú de Inicio y Selección de Dificultad -->
      <div v-if="gameState === 'menu'" class="overlay menu-overlay">
        <h2>DIFICULTAD Y PUNTUACIÓN</h2>
        <p class="overlay-desc">Elige tu nivel de desafío. ¡Dificultades más altas otorgan un multiplicador de puntos superior!</p>
        
        <div class="settings-panel">
          <div class="settings-row">
            <span class="settings-label">Selecciona Dificultad:</span>
            <div class="btn-group">
              <button 
                v-for="diff in difficulties" 
                :key="diff.id"
                class="settings-btn"
                :class="{ 'active': difficulty === diff.id }"
                @click="setDifficulty(diff.id)"
              >
                {{ diff.name }}
              </button>
            </div>
          </div>
        </div>

        <button class="primary-btn" @click="startGame">EMPEZAR A JUGAR</button>
      </div>
    </div>

    <!-- Controles táctiles en pantalla -->
    <div class="controls-panel" v-if="gameState === 'playing'">
      <div class="d-pad">
        <div class="d-pad-row">
          <button class="d-btn up" @click="changeDirection('UP')">▲</button>
        </div>
        <div class="d-pad-row">
          <button class="d-btn left" @click="changeDirection('LEFT')">◀</button>
          <div class="d-btn-center"></div>
          <button class="d-btn right" @click="changeDirection('RIGHT')">▶</button>
        </div>
        <div class="d-pad-row">
          <button class="d-btn down" @click="changeDirection('DOWN')">▼</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const GRID_SIZE = 20; 
const TILE_COUNT = 20; 

const difficulties = [
  { id: 'easy', name: 'Fácil', speed: 180, multiplier: 1.0 },
  { id: 'medium', name: 'Medio', speed: 130, multiplier: 1.5 },
  { id: 'hard', name: 'Difícil', speed: 90, multiplier: 2.0 },
  { id: 'insane', name: 'Extremo', speed: 60, multiplier: 3.0 }
];

const gameCanvas = ref(null);
let ctx = null;
let gameInterval = null;
let drawRequest = null;

// Estados reactivos
const gameState = ref('menu'); 
const score = ref(0);
const highScore = ref(parseInt(localStorage.getItem('snake_highscore') || '0'));
const level = ref(1);
const difficulty = ref('medium');
const newHighScore = ref(false);

// Parámetros internos de velocidad, dirección, serpiente
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = { x: 10, y: 10 };
let currentSpeed = 130; 

// Cálculo del porcentaje de velocidad mostrado en el panel
const speedDisplay = computed(() => {
  const baseSpeed = difficulties.find(d => d.id === difficulty.value)?.speed || 130;
  return Math.round((baseSpeed / currentSpeed) * 100);
});

const setDifficulty = (diffId) => {
  difficulty.value = diffId;
};

const startGame = () => {
  gameState.value = 'playing';
  score.value = 0;
  level.value = 1;
  newHighScore.value = false;
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];

  // Configurar velocidad inicial
  const activeDiff = difficulties.find(d => d.id === difficulty.value);
  currentSpeed = activeDiff ? activeDiff.speed : 130;

  spawnFood();
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, currentSpeed);
  
  requestDraw();
};

const spawnFood = () => {
  let attempts = 0;
  while (attempts < 100) {
    const fx = Math.floor(Math.random() * TILE_COUNT);
    const fy = Math.floor(Math.random() * TILE_COUNT);
    const onSnake = snake.some(segment => segment.x === fx && segment.y === fy);
    if (!onSnake) {
      food = { x: fx, y: fy };
      break;
    }
    attempts++;
  }
};

const changeDirection = (newDir) => {
  const oppositeDirs = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT'
  };

  if (newDir !== oppositeDirs[direction]) {
    nextDirection = newDir;
  }
};

const gameLoop = () => {
  if (gameState.value !== 'playing') return;

  direction = nextDirection;
  const head = { ...snake[0] };

  if (direction === 'LEFT') head.x -= 1;
  else if (direction === 'RIGHT') head.x += 1;
  else if (direction === 'UP') head.y -= 1;
  else if (direction === 'DOWN') head.y += 1;

  // Colisión límites
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    triggerGameOver();
    return;
  }

  // Colisión cuerpo
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    triggerGameOver();
    return;
  }

  snake.unshift(head);

  // Ingestión de comida
  if (head.x === food.x && head.y === food.y) {
    const activeDiff = difficulties.find(d => d.id === difficulty.value);
    const mult = activeDiff ? activeDiff.multiplier : 1.0;
    
    // Incremento según dificultad
    score.value += Math.round(10 * mult);
    spawnFood();

    // Lógica dinámica de niveles y velocidad (+7% velocidad cada 50 puntos)
    const newLevel = Math.floor(score.value / 50) + 1;
    if (newLevel > level.value) {
      level.value = newLevel;
      currentSpeed = Math.max(40, Math.round(currentSpeed * 0.93));
      
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, currentSpeed);
    }
  } else {
    snake.pop();
  }
};

const triggerGameOver = () => {
  gameState.value = 'gameover';
  if (gameInterval) clearInterval(gameInterval);

  // Récord local persistente
  if (score.value > highScore.value) {
    highScore.value = score.value;
    localStorage.setItem('snake_highscore', highScore.value.toString());
    newHighScore.value = true;
  }
};

const resetToMenu = () => {
  gameState.value = 'menu';
};

const requestDraw = () => {
  if (gameState.value === 'menu') return;
  draw();
  drawRequest = requestAnimationFrame(requestDraw);
};

const draw = () => {
  if (!ctx || !gameCanvas.value) return;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 400, 400);

  // Rejilla sutil
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, 400);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(400, i * GRID_SIZE);
    ctx.stroke();
  }

  // Comida
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Serpiente
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.fillStyle = isHead ? '#22c55e' : '#4ade80';
    
    const rx = segment.x * GRID_SIZE;
    const ry = segment.y * GRID_SIZE;

    ctx.beginPath();
    if (isHead) {
      ctx.arc(rx + GRID_SIZE / 2, ry + GRID_SIZE / 2, GRID_SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(rx + 6, ry + 6, 2, 0, Math.PI * 2);
      ctx.arc(rx + 14, ry + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.roundRect(rx + 1, ry + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
      ctx.fill();
    }
  });
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  ctx = gameCanvas.value?.getContext('2d');
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (gameInterval) clearInterval(gameInterval);
  if (drawRequest) cancelAnimationFrame(drawRequest);
});

const handleKeyDown = (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }

  if (gameState.value === 'playing') {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        changeDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        changeDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        changeDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        changeDirection('RIGHT');
        break;
    }
  }
};
</script>

<style scoped>
.snake-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #1e293b;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  color: #f8fafc;
}

.game-header {
  margin-bottom: 0.5rem;
}

.game-title {
  font-size: 1.6rem;
  margin: 0;
}

/* Panel de Puntuación Premium */
.score-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}
.score-item {
  display: flex;
  flex-direction: column;
}
.score-item .label {
  font-size: 0.6rem;
  font-weight: bold;
  opacity: 0.6;
  letter-spacing: 0.5px;
}
.score-item .value {
  font-size: 1rem;
  font-weight: 800;
  color: #38bdf8;
}

.canvas-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #334155;
}

.game-canvas {
  display: block;
}

/* Superposiciones */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.93);
  backdrop-filter: blur(4px);
  padding: 1.5rem;
  text-align: center;
}

.overlay-desc {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 1.2rem;
  line-height: 1.3;
}

.primary-btn {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
  color: #f8fafc;
  border: none;
  font-size: 0.95rem;
  font-weight: bold;
  padding: 0.7rem 1.6rem;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  transition: all 0.2s;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.45);
}

.settings-panel {
  width: 100%;
  margin-bottom: 1rem;
}
.settings-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.settings-label {
  font-size: 0.75rem;
  font-weight: bold;
  opacity: 0.8;
}
.btn-group {
  display: flex;
  gap: 0.3rem;
}
.settings-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.settings-btn:hover, .settings-btn.active {
  background-color: #22c55e;
  border-color: #22c55e;
  color: #0f172a;
}

.stats-summary {
  margin-bottom: 1.2rem;
  font-size: 1rem;
}
.highlight {
  font-weight: bold;
  color: #38bdf8;
}
.text-red {
  color: #f43f5e;
}
.new-record-banner {
  color: #eab308;
  font-weight: bold;
  margin-top: 0.4rem;
  animation: pulsing 1.2s infinite;
}

@keyframes pulsing {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

/* D-PAD */
.controls-panel {
  margin-top: 1rem;
}
.d-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.d-pad-row {
  display: flex;
  justify-content: center;
}
.d-btn {
  width: 48px;
  height: 48px;
  background-color: #334155;
  border: none;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.d-btn:active {
  background-color: #475569;
}
.d-btn-center {
  width: 48px;
  height: 48px;
  margin: 2px;
}

@media (max-width: 440px) {
  .canvas-wrapper {
    width: 300px;
    height: 300px;
  }
  .game-canvas {
    width: 300px;
    height: 300px;
  }
}
</style>

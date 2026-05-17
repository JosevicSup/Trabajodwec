<template>
  <div class="snake-container">
    <header class="game-header">
      <h1 class="game-title">Neo Snake 🐍</h1>
      <div class="score-display">Puntos: <span class="score-value">{{ score }}</span></div>
    </header>

    <div class="canvas-wrapper">
      <canvas 
        ref="gameCanvas" 
        width="400" 
        height="400" 
        class="game-canvas"
      ></canvas>

      <!-- Superposición de Fin de Juego -->
      <div v-if="gameOver" class="gameover-overlay">
        <h2>FIN DE JUEGO</h2>
        <p>Puntuación: {{ score }}</p>
        <button class="restart-btn" @click="startGame">Jugar de nuevo</button>
      </div>

      <!-- Superposición de Inicio -->
      <div v-if="gameState === 'menu'" class="menu-overlay">
        <h2>SNAKE CORE ENGINE</h2>
        <p>Controla la serpiente con WASD, las Flechas de dirección o los botones en pantalla.</p>
        <button class="start-btn" @click="startGame">INICIAR JUEGO</button>
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
import { ref, onMounted, onUnmounted } from 'vue';

const GRID_SIZE = 20; // Tamaño de celda en px
const TILE_COUNT = 20; // 20x20 celdas = 400x400 px

const gameCanvas = ref(null);
let ctx = null;
let gameInterval = null;
let drawRequest = null;

// Estados de juego reactivos
const gameState = ref('menu'); // 'menu', 'playing', 'gameover'
const score = ref(0);
const gameOver = ref(false);

// Variables de la serpiente y comida
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = { x: 10, y: 10 };
const speed = 150; // velocidad base constante (150ms)

const startGame = () => {
  gameState.value = 'playing';
  score.value = 0;
  gameOver.value = false;
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  
  // Posición inicial de la serpiente
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];

  spawnFood();
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
  
  requestDraw();
};

const spawnFood = () => {
  let attempts = 0;
  while (attempts < 100) {
    const fx = Math.floor(Math.random() * TILE_COUNT);
    const fy = Math.floor(Math.random() * TILE_COUNT);
    
    // Evitar que aparezca encima de la serpiente
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

  // Mover cabeza
  if (direction === 'LEFT') head.x -= 1;
  else if (direction === 'RIGHT') head.x += 1;
  else if (direction === 'UP') head.y -= 1;
  else if (direction === 'DOWN') head.y += 1;

  // Comprobar colisión con límites
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    triggerGameOver();
    return;
  }

  // Comprobar colisión con el propio cuerpo
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    triggerGameOver();
    return;
  }

  // Añadir nueva cabeza
  snake.unshift(head);

  // Comprobar si come comida
  if (head.x === food.x && head.y === food.y) {
    score.value += 10;
    spawnFood();
  } else {
    // Si no come, remueve la cola para simular movimiento continuo
    snake.pop();
  }
};

const triggerGameOver = () => {
  gameState.value = 'gameover';
  gameOver.value = true;
  if (gameInterval) clearInterval(gameInterval);
};

const requestDraw = () => {
  if (gameState.value === 'menu') return;
  draw();
  drawRequest = requestAnimationFrame(requestDraw);
};

const draw = () => {
  if (!ctx || !gameCanvas.value) return;

  // Limpiar lienzo
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 400, 400);

  // Dibujar cuadrícula muy sutil
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

  // Dibujar Comida (Círculo Rojo)
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

  // Dibujar Serpiente
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.fillStyle = isHead ? '#22c55e' : '#4ade80';
    
    const rx = segment.x * GRID_SIZE;
    const ry = segment.y * GRID_SIZE;

    ctx.beginPath();
    if (isHead) {
      // Cabeza redonda
      ctx.arc(rx + GRID_SIZE / 2, ry + GRID_SIZE / 2, GRID_SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.fill();

      // Ojos de la serpiente
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(rx + 6, ry + 6, 2, 0, Math.PI * 2);
      ctx.arc(rx + 14, ry + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cuerpo cuadrado con esquinas curvas
      ctx.roundRect(rx + 1, ry + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
      ctx.fill();
    }
  });
};

const handleKeyDown = (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault(); // Evitar scroll de pantalla
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

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  ctx = gameCanvas.value?.getContext('2d');
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (gameInterval) clearInterval(gameInterval);
  if (drawRequest) cancelAnimationFrame(drawRequest);
});
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
}

.game-title {
  font-size: 1.5rem;
  margin: 0;
}

.score-display {
  font-size: 1.1rem;
  font-weight: bold;
}

.score-value {
  color: #22c55e;
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
.gameover-overlay, .menu-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  padding: 1.5rem;
  text-align: center;
}

.restart-btn, .start-btn {
  background-color: #22c55e;
  color: #0f172a;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.restart-btn:hover, .start-btn:hover {
  background-color: #4ade80;
}

/* D-PAD Móvil */
.controls-panel {
  margin-top: 1.5rem;
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
  width: 50px;
  height: 50px;
  background-color: #334155;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.d-btn:active {
  background-color: #475569;
}

.d-btn-center {
  width: 50px;
  height: 50px;
  margin: 3px;
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

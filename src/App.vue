<template>
  <main class="app-main">
    <div class="game-wrapper">
      <SnakeGame />
    </div>
  </main>
</template>

<script setup>
import SnakeGame from './components/SnakeGame.vue';
</script>

<style scoped>
.app-main {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #05050e;
  color: #fff;
  font-family: sans-serif;
}
</style>

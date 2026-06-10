<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
  <div class="card">
    <h2>
      MindGenius
      <span>AI Mind Map</span>
    </h2>
    <div>
      Unleash Minds, Spark Ideas
      <Icon icon="material-symbols:arrow-right-alt-rounded" width="50" color="white" />
    </div>
  </div>
</template>

<style scoped>
.card {
    width: 450px;
    height: 450px;
    position: relative;
    border-radius: 40px;
    padding: 40px;
    z-index: 0;
    box-sizing: border-box;
    overflow: hidden;
    box-shadow: inset 0px 0px 40px rgba(0, 0, 0, .8), 0px 8px 20px rgba(0, 0, 0, .6);
}

.card::after {
    content: '';
    position: absolute;
    top: -300px;
    right: -300px;
    bottom: -300px;
    left: -300px;
    background: conic-gradient(from 180deg at 50% 50%, #12001B -97.5deg, #000000 14.05deg, #040EFF 54.01deg, #8000FF 113.42deg, #00B6B6 185.62deg, #12001B 262.5deg, #000000 374.05deg);
    filter: blur(60px) brightness(1.5);
    z-index: -1;
    animation: 30s move linear infinite;
}

h2 {
    margin: 0;
    padding: 0;
    font-size: 60px;
    letter-spacing: -1px;
    color: #fff;
    text-shadow: 0px 2px 4px rgba(0, 0, 0, .3);
}

span {
    font-size: 50px;
    font-weight: normal;
    display: block;
}

.card>div {
    background-color: rgba(0, 0, 0, 0.5);
    padding: 20px 40px;
    font-size: 32px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@keyframes move {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(540deg);
    }
}
</style>

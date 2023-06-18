<!-- eslint-disable no-console -->
<script setup lang="ts">
import { inject, onMounted } from 'vue'

const getNode: any = inject('getNode')

onMounted(() => {
  const node = getNode()
  console.log(node)
})
</script>

<template>
  <div class="sticky-note">
    <div class="sticky-note-content">
      This is a sticky note content, you can add the text or other elements you need here.
    </div>
    <div class="sticky-note-corner" />
  </div>
</template>

<style scoped>
.sticky-note {
  position: relative;
  display: inline-block;
  width: 200px;
  height: 200px;
  background-color: #f7dc6f;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  color: #333;
  line-height: 1.5;
  overflow: hidden;
}

.sticky-note-content {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  overflow-y: auto;
  font-size: 18px;
}

.sticky-note-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #f1c40f transparent transparent;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
</style>

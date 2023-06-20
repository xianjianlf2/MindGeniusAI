<script setup lang="ts">
import { ref } from 'vue'

const dataSource = ref([
  {
    operate: 'generate mind map',
    method: 'Get Start',
  },
  {
    operate: 'zoom in / zoom out',
    method: 'Mouse Wheel',
  },
  {
    operate: 'delete',
    method: 'Delete / Backspace',
  },
  {
    operate: 'drag',
    method: 'Mouse Drag',
  },
  {
    operate: 'select elements',
    method: 'Alt + Mouse',
  },
])

const columns = ref([
  {
    title: 'Index',
    customRender: ({ index }: { index: number }) => `${index + 1}`,
  },
  {
    title: 'Operate',
    dataIndex: 'operate',
    key: 'operate',
  },
  {
    title: 'Method',
    dataIndex: 'method',
    key: 'method',
  },
])
</script>

<template>
  <a-table :data-source="dataSource" :columns="columns" bordered>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'method'">
        <div class="keycap-container">
          <div class="keycap">
            {{ text }}
          </div>
        </div>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.keycap-container {
  display: inline-block;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  text-align: center;
}

.keycap {
  display: inline-block;
  padding: 5px 10px;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 3px;
  margin: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.keycap:hover {
  background-color: #f9f9f9;
  border-color: #999999;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.keycap:active {
  background-color: #f0f0f0;
  border-color: #666666;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const dataSource = ref([
  {
    operateName: 'generate mind map',
    operations: [
      {
        text: 'Click',
      },
      {
        text: 'Get start',
        type: 'keycap',
      },
    ],
  },
  {
    operateName: 'zoom in / zoom out',
    operations: [
      {
        text: 'Mouse scrolling',
        type: 'keycap',
      }],
  },
  {
    operateName: 'delete',
    operations: [
      {
        text: 'Click',
      },
      {
        text: 'Delete',
        type: 'keycap',
      },
      {
        text: 'or',
      },
      {
        text: 'Backspace',
        type: 'keycap',
      },
    ],
  },
  {
    operateName: 'drag',
    operations: [
      {
        text: 'Click and drag on the blank area',
      },
    ],
  },
  {
    operateName: 'select elements',
    operations: [
      {
        text: 'Hold down the',
      },
      {
        text: 'alt',
        type: 'keycap',
      },
      {
        text: 'key and drag the mouse',
      },
    ],
  },
])

const columns = ref([
  {
    title: 'Index',
    customRender: ({ index }: { index: number }) => `${index + 1}`,
  },
  {
    title: 'Operate',
    dataIndex: 'operateName',
    key: 'operateName',
  },
  {
    title: 'Operations',
    dataIndex: 'operations',
    key: 'operations',
  },
])
</script>

<template>
  <a-table :data-source="dataSource" :columns="columns" bordered>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'operations'">
        <div class="flex items-center justify-start">
          <span v-for="item in text" :key="item" :class="item.type ? 'keycap' : ''">
            {{ item.text }}
          </span>
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

<script setup lang="ts">
import { ref } from 'vue'

const dataSource = ref([
  {
    operate: 'get start',
    method: 'click `Get Start`',
  },
  {
    operate: 'zoom in / zoom out',
    method: 'mouse wheel',
  },
  {
    operate: 'delete',
    method: 'delete',
  },
  {
    operate: 'drag',
    method: 'mouse',
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
        <a-tag>{{ text }}</a-tag>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { NModal } from 'naive-ui'
import { watch } from 'vue'
import { useCommandModal } from './commandModal'
import CommandModalBody from './CommandModalBody.vue'
import CommandModalFooter from './CommandModalFooter.vue'
import { useSearch } from './search'

const { showCommandModal, registerKeyboardShortcut } = useCommandModal()
const { resetSearch } = useSearch()

registerKeyboardShortcut()

watch(() => showCommandModal.value, (v) => {
  if (!v)
    resetSearch()
})
</script>

<template>
  <NModal
    v-model:show="showCommandModal" display-directive="show" preset="card" style="width: 600px;"
    title="Search"
    :footer-style="{ background: '#121923' }"
  >
    <CommandModalBody />
    <template #footer>
      <CommandModalFooter />
    </template>
  </NModal>
</template>

<style scoped></style>

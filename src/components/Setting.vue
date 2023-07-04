<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { StorageKey, storageManager } from '@/utils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update:modelValue'])
const open = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

interface FormState {
  openAIKey: string
  openAIProxy: string
}
const formState = reactive({
  openAIKey: '',
  openAIProxy: '',
})
const formRef = ref()

function setLocalStorage(values: FormState) {
  storageManager.remove('openAIKey')
  storageManager.remove('openAIProxy')
  storageManager.set(StorageKey.OPENAI_KEY, values.openAIKey.trim())
  storageManager.set(StorageKey.OPENAI_PROXY, values.openAIProxy.trim())
}
async function submit() {
  try {
    const values: FormState = await formRef.value.validateFields()
    setLocalStorage(values)
    message.success('Setting saved!')
  }
  catch (errorInfo) {
  }
}
function initKey() {
  formState.openAIKey = storageManager.get(StorageKey.OPENAI_KEY) || ''
  formState.openAIProxy = storageManager.get(StorageKey.OPENAI_PROXY) || ''
}
onMounted(() => {
  initKey()
})
</script>

<template>
  <a-modal v-model:open="open" title="Environment Setting" @ok="submit">
    <div class="container mx-auto p-4">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-form-item
          label="OpenAI Key"
          name="openAIKey"
          :rules="[{ required: true, message: 'Please input your OpenAI Key!' }]"
        >
          <a-input-password v-model:value="formState.openAIKey" />
        </a-form-item>
        <a-form-item
          label="OpenAI Proxy"
          name="openAIProxy"
        >
          <a-input v-model:value="formState.openAIProxy" />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped></style>
@/utils/storageManager

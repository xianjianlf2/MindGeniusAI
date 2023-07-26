<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSpace, useMessage } from 'naive-ui'
import { StorageKey, storageManager } from '@/utils'

const message = useMessage()

const formState = ref({
  openAIKey: '',
  openAIProxy: '',
})

const formRef = ref<InstanceType<typeof NForm>>()

function setLocalStorage() {
  storageManager.remove(StorageKey.OPENAI_KEY)
  storageManager.remove(StorageKey.OPENAI_PROXY)
  storageManager.set(StorageKey.OPENAI_KEY, formState.value.openAIKey.trim())
  storageManager.set(StorageKey.OPENAI_PROXY, formState.value.openAIProxy.trim())
}
function handleSubmit() {
  formRef.value?.validate((err) => {
    if (!err) {
      setLocalStorage()
      message.success('Setting saved!')
    }
  })
}
function initKey() {
  formState.value.openAIKey = storageManager.get(StorageKey.OPENAI_KEY) || ''
  formState.value.openAIProxy = storageManager.get(StorageKey.OPENAI_PROXY) || ''
}

function handleReset() {
  formState.value = {
    openAIKey: '',
    openAIProxy: '',
  }
  message.info('Setting reset!')
  nextTick(() => {
    setLocalStorage()
  })
}

onMounted(() => {
  initKey()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <NForm
      ref="formRef"
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <NFormItem
        label="OpenAI Key"
        name="openAIKey"
        :rules="[{ required: true, message: 'Please input your OpenAI Key!' }]"
      >
        <NInput v-model:value="formState.openAIKey" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem
        label="OpenAI Proxy"
        name="openAIProxy"
      >
        <NInput v-model:value="formState.openAIProxy" />
      </NFormItem>
      <NSpace justify="center">
        <NButton strong secondary @click="handleReset">
          Reset
        </NButton>
        <NButton type="primary" strong secondary @click="handleSubmit">
          Confirm
        </NButton>
      </NSpace>
    </NForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSpace } from 'naive-ui'
import { useKeyConfig } from './useKeyConfig'
import { messageInfo, messageSuccess } from '@/hooks/message'

const formRef = ref<InstanceType<typeof NForm>>()
const { initConfig, resetConfig, keyConfig, setConfig } = useKeyConfig()

function handleSubmit() {
  formRef.value?.validate((err) => {
    if (!err) {
      setConfig()
      messageSuccess('Setting saved!')
    }
  })
}

function handleReset() {
  resetConfig()
  messageInfo('Setting reset!')
}

onMounted(() => {
  initConfig()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <NForm
      ref="formRef"
      :model="keyConfig"
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
        <NInput v-model:value="keyConfig.openAIKey" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem
        label="OpenAI Proxy"
        name="openAIProxy"
      >
        <NInput v-model:value="keyConfig.openAIProxy" />
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

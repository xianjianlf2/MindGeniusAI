import { Form, Input, Modal, Select } from 'antd'
import { useEffect } from 'react'
import { StorageKey, storageManager } from '@/utils/storage'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        apiKey: storageManager.get(StorageKey.OPENAI_KEY),
        proxy: storageManager.get(StorageKey.OPENAI_PROXY),
        provider: storageManager.get(StorageKey.LLM_PROVIDER) || 'openai',
      })
    }
  }, [open, form])

  return (
    <Modal
      title="Settings"
      open={open}
      onCancel={onClose}
      onOk={() => {
        const { apiKey, proxy, provider } = form.getFieldsValue()
        storageManager.set(StorageKey.OPENAI_KEY, apiKey)
        if (proxy)
          storageManager.set(StorageKey.OPENAI_PROXY, proxy)
        else
          storageManager.remove(StorageKey.OPENAI_PROXY)
        storageManager.set(StorageKey.LLM_PROVIDER, provider)
        onClose()
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="provider" label="LLM Provider">
          <Select
            options={[
              { value: 'openai', label: 'OpenAI' },
              { value: 'anthropic', label: 'Anthropic (Claude)' },
              { value: 'deepseek', label: 'DeepSeek' },
            ]}
          />
        </Form.Item>
        <Form.Item name="apiKey" label="API Key" tooltip="仅存于浏览器 localStorage，随请求发送给你自己的后端">
          <Input.Password placeholder="sk-..." />
        </Form.Item>
        <Form.Item name="proxy" label="API Base URL（可选代理）">
          <Input placeholder="https://api.openai.com/v1" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

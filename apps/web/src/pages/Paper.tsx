import { FilePdfOutlined, InboxOutlined } from '@ant-design/icons'
import { Button, Empty, List, Upload, message as antdMessage } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { getFileListRequest, initDocumentRequest, uploadFileRequest } from '@/api/requests'
import { ChatPanel } from '@/components/ChatPanel'
import { createChatStore } from '@/stores/chatStore'

const WELCOME = 'Upload a PDF, initialize its index, then ask me anything about it.'

export default function Paper() {
  const [files, setFiles] = useState<string[]>([])
  const [activeFile, setActiveFile] = useState<string>()
  const [indexed, setIndexed] = useState<Set<string>>(new Set())
  const [initializing, setInitializing] = useState(false)
  const useChat = useMemo(() => createChatStore(WELCOME), [])
  const { messages, isLoading, send, stop, clear } = useChat()
  const [messageApi, contextHolder] = antdMessage.useMessage()

  const refreshFiles = async () => {
    const result = await getFileListRequest()
    if (result.success)
      setFiles(result.data?.files ?? [])
  }

  useEffect(() => {
    refreshFiles()
  }, [])

  const initIndex = async (fileName: string) => {
    setInitializing(true)
    try {
      const result = await initDocumentRequest(fileName)
      if (result.success) {
        setIndexed(prev => new Set(prev).add(fileName))
        messageApi.success('Document indexed.')
      }
      else {
        messageApi.error(result.message ?? 'Index failed')
      }
    }
    finally {
      setInitializing(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {contextHolder}
      <div style={{ width: 300, borderRight: '1px solid #1e293b', padding: 12, overflowY: 'auto' }}>
        <Upload.Dragger
          accept=".pdf"
          showUploadList={false}
          customRequest={async ({ file, onSuccess, onError }) => {
            const formData = new FormData()
            formData.append('files', file)
            try {
              const result = await uploadFileRequest(formData)
              if (result.success) {
                messageApi.success('Uploaded')
                onSuccess?.(result)
                await refreshFiles()
              }
              else {
                throw new Error(result.message)
              }
            }
            catch (error) {
              messageApi.error((error as Error).message)
              onError?.(error as Error)
            }
          }}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p style={{ color: '#94a3b8' }}>点击或拖拽上传 PDF</p>
        </Upload.Dragger>

        <List
          style={{ marginTop: 12 }}
          dataSource={files}
          renderItem={file => (
            <List.Item
              style={{
                cursor: 'pointer',
                background: file === activeFile ? '#1e293b' : undefined,
                borderRadius: 6,
                padding: '8px',
              }}
              onClick={() => setActiveFile(file)}
              actions={[
                indexed.has(file)
                  ? <span key="ok" style={{ color: '#10b981' }}>ready</span>
                  : (
                    <Button
                      key="init"
                      size="small"
                      loading={initializing && file === activeFile}
                      onClick={(event) => {
                        event.stopPropagation()
                        setActiveFile(file)
                        initIndex(file)
                      }}
                    >
                      init
                    </Button>
                    ),
              ]}
            >
              <FilePdfOutlined style={{ marginRight: 6 }} />
              <span style={{ wordBreak: 'break-all', flex: 1 }}>{file}</span>
            </List.Item>
          )}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {activeFile
          ? <iframe title="pdf" src={`/api/${activeFile}`} style={{ width: '100%', height: '100%', border: 'none' }} />
          : <Empty style={{ marginTop: 120 }} description="选择一个 PDF 预览" />}
      </div>

      <div style={{ width: 380, borderLeft: '1px solid #1e293b' }}>
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          placeholder={activeFile ? `Ask about ${activeFile}` : '先选择并初始化一个 PDF'}
          onSend={(text) => {
            if (!activeFile || !indexed.has(activeFile)) {
              messageApi.warning('Please init the document index first')
              return
            }
            send({
              url: '/api/document/query',
              data: { query: [text], fileName: activeFile, isStream: true },
              userText: text,
            })
          }}
          onStop={stop}
          onClear={clear}
        />
      </div>
    </div>
  )
}

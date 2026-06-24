import { create } from 'zustand'
import { getFileListRequest, initDocumentRequest, uploadFileRequest } from '@/api/requests'
import { translate } from '@/i18n'
import { useUiStore } from '@/stores/uiStore'

export type DocStatus = 'idle' | 'uploading' | 'indexing' | 'ready'

export interface DocFile {
  /** 服务端文件名（uuid.pdf），也是 RAG 检索的 fileName */
  name: string
  /** 本次会话上传时的原始文件名，仅用于展示 */
  displayName?: string
  status: DocStatus
  progress?: number
  error?: string
}

interface DocState {
  files: DocFile[]
  /** 作为对话上下文附加给 /agent 的文件（须已索引） */
  attached: string | null
  refresh: () => Promise<void>
  upload: (file: File, options?: { attach?: boolean }) => Promise<void>
  index: (name: string) => Promise<boolean>
  setAttached: (name: string | null) => void
}

export const docDisplayName = (doc: DocFile) => doc.displayName ?? doc.name

export const useDocStore = create<DocState>((set, get) => {
  const patch = (name: string, partial: Partial<DocFile>) =>
    set(state => ({ files: state.files.map(file => (file.name === name ? { ...file, ...partial } : file)) }))

  return {
    files: [],
    attached: null,

    async refresh() {
      try {
        const result = await getFileListRequest()
        if (!result.success)
          return
        const serverFiles = result.data?.files ?? []
        set((state) => {
          const known = new Map(state.files.map(file => [file.name, file]))
          return {
            files: serverFiles.map(name => known.get(name) ?? { name, status: 'idle' as DocStatus }),
          }
        })
      }
      catch {
        // 列表加载失败不打断主流程
      }
    },

    async upload(file, options) {
      const tempName = `__uploading__${Date.now()}`
      set(state => ({
        files: [...state.files, { name: tempName, displayName: file.name, status: 'uploading', progress: 0 }],
      }))
      try {
        const formData = new FormData()
        formData.append('files', file)
        const result = await uploadFileRequest(formData, percent => patch(tempName, { progress: percent }))
        if (!result.success || !result.fileName)
          throw new Error(result.message ?? translate(useUiStore.getState().locale, 'err.uploadFailed'))
        const serverName = result.fileName
        set(state => ({
          files: state.files.map(item =>
            item.name === tempName
              ? { name: serverName, displayName: file.name, status: 'indexing' as DocStatus }
              : item),
        }))
        const ok = await get().index(serverName)
        if (ok && options?.attach)
          set({ attached: serverName })
      }
      catch (error) {
        set(state => ({ files: state.files.filter(item => item.name !== tempName) }))
        throw error
      }
    },

    async index(name) {
      patch(name, { status: 'indexing', error: undefined })
      try {
        const result = await initDocumentRequest(name)
        if (result.success) {
          patch(name, { status: 'ready' })
          return true
        }
        patch(name, { status: 'idle', error: result.message ?? translate(useUiStore.getState().locale, 'err.indexFailed') })
        return false
      }
      catch (error) {
        patch(name, { status: 'idle', error: (error as Error).message })
        return false
      }
    },

    setAttached: attached => set({ attached }),
  }
})

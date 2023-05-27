import mimeTypes from 'mime-types'
import type { File } from '@koa/multer'

export function validateFileFormat(file: File) {
  const mimeType = mimeTypes.lookup(file.originalname)
  let flag = false
  switch (mimeType) {
    case 'application/pdf':
      flag = true
      break

    case 'application/epub+zip':
      flag = true
      break

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      flag = true
      break

    case 'text/plain':
      flag = true
      break

    case 'text/markdown':
      flag = true
      break
  }
  return flag
}

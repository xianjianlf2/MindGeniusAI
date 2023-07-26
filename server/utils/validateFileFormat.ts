import mimeTypes from 'mime-types'
import type { File } from '@koa/multer'

export function validateFileFormat(file: File) {
  const mimeType = mimeTypes.lookup(file.originalname)
  let flag = false
  switch (mimeType) {
    case 'application/pdf':
      flag = true
      break
  }
  return flag
}

import { storageManager } from './storageManager'

export function getToken() {
  return storageManager.get('token')
}

export function checkHaveToken() {
  return getToken()
}

export function setToken(token: string) {
  storageManager.set('token', token)
}

export function cleanToken() {
  storageManager.remove('token')
}

import { loadingBar } from './discreteApi'

export function startLoading() {
  loadingBar.start()
}

export function finishLoading() {
  loadingBar.finish()
}

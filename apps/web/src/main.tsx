import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initAnalytics } from '@/utils/analytics'
import './style.css'

initAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

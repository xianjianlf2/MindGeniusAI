import { createApp } from 'vue'
import '@unocss/reset/normalize.css'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import 'virtual:uno.css'
import 'ant-design-vue/dist/reset.css'
import './assets/style/main.css'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(MotionPlugin)

app.mount('#app')

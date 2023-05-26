import { createApp } from 'vue'
import '@unocss/reset/normalize.css'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'virtual:uno.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import 'ant-design-vue/dist/reset.css'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Antd)
app.mount('#app')

// ====================
// 概念音乐 APK — Entry Point
// ====================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { initNodeServer } from './utils/nodejs-bridge'

// 启动内嵌 Node.js 服务器（nodejs-mobile-cordova）
// 如果插件未加载，自动回退到 localhost:3000
initNodeServer()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

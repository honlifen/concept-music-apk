// ====================
// 概念音乐 APK — Node.js 启动桥接
// 源码逻辑：启动内嵌 kugoumusicapi 服务器
// ====================

let serverReady = false
let readyCallbacks = []

export function onServerReady(cb) {
  if (serverReady) return cb()
  readyCallbacks.push(cb)
}

export function initNodeServer() {
  // nodejs-mobile-cordova 提供的全局对象
  if (typeof nodejs === 'undefined') {
    console.warn('[NodeJS] nodejs-mobile 插件未加载，使用本地服务器')
    // 没有插件时，假设服务器已在 Termux 运行
    serverReady = true
    readyCallbacks.forEach(cb => cb())
    readyCallbacks = []
    return
  }

  // 监听 Node.js 消息
  nodejs.channel.on('server-ready', () => {
    console.log('[NodeJS] kugoumusicapi 服务器就绪 :3000')
    serverReady = true
    readyCallbacks.forEach(cb => cb())
    readyCallbacks = []
  })

  nodejs.channel.on('server-error', (msg) => {
    console.error('[NodeJS] 服务器错误:', msg)
    // 回退：标记为就绪（让前端尝试连接，可能已运行）
    serverReady = true
    readyCallbacks.forEach(cb => cb())
    readyCallbacks = []
  })

  // 启动 Node.js 引擎
  nodejs.start('main.js', (err) => {
    if (err) {
      console.error('[NodeJS] 启动失败:', err)
      serverReady = true
      readyCallbacks.forEach(cb => cb())
      readyCallbacks = []
    }
  })
}

// ====================
// 概念音乐 APK — 服务器桥接
// 连接本地 kugoumusicapi (Termux:3000) 或自定义地址
// ====================

let serverReady = false
let readyCallbacks = []

export function onServerReady(cb) {
  if (serverReady) return cb()
  readyCallbacks.push(cb)
}

export function initNodeServer() {
  // APK 连接 Termux 本地服务器 :3000
  // 也可以用 Settings 页面切换自定义地址
  serverReady = true
  readyCallbacks.forEach(cb => cb())
  readyCallbacks = []
}

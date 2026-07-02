// ====================
// 概念音乐 APK — API Request Layer
// 适配 Capacitor Android 环境
// ====================
import axios from 'axios'

const STORAGE_KEY = 'cm_apk_api_base'

const getSavedBase = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch { return '' }
}

const DEFAULT_BASE = '/api'

// APK 默认连接本地服务器 (Termux 运行 kugoumusicapi)
const DEFAULT_API_SERVER = 'http://127.0.0.1:3000'

// 支持从 localStorage 读取自定义服务器地址
const resolveBase = () => {
  const saved = getSavedBase()
  if (saved) {
    try {
      new URL(saved)
      return saved.replace(/\/+$/, '') + '/api'
    } catch {}
  }
  return DEFAULT_API_SERVER + '/api'
}

const request = axios.create({
  baseURL: resolveBase(),
  timeout: 15000
})

// 允许运行时切换 API 地址
export const setApiBase = (url) => {
  const base = url.replace(/\/+$/, '')
  request.defaults.baseURL = base + '/api'
  localStorage.setItem(STORAGE_KEY, base)
}

export const getApiBase = () => {
  return getSavedBase() || window.location.origin
}

request.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get') {
    if (!config.params || !Object.prototype.hasOwnProperty.call(config.params, 'timestamp')) {
      config.params = { ...config.params, timestamp: Date.now() }
    }
  }
  return config
}, (error) => Promise.reject(error))

request.interceptors.response.use(
  (response) => {
    if (response.data?.errcode === 20028) {
      localStorage.removeItem('kg_desktop_has_dfid')
      console.warn('[API] 请求验证受限')
    }
    return response.data
  },
  async (error) => {
    const config = error.config
    if (config && typeof config.retryCount !== 'number') {
      config.retryCount = 0
    }
    const isNetworkError = error.message === 'Network Error' || error.code === 'ECONNREFUSED'
    if (config && isNetworkError && config.retryCount < 2) {
      config.retryCount += 1
      await new Promise(r => setTimeout(r, 500))
      return request(config)
    }
    console.error(`[API] ${config?.url}:`, error.message)
    return Promise.reject(error)
  }
)

// 去重 dev 注册请求
const originalGet = request.get
let devPromise = null

request.get = async function (...args) {
  const url = args[0]
  if (url === '/register/dev' || url === '/api/register/dev') {
    if (localStorage.getItem('kg_desktop_has_dfid') === 'true') {
      return Promise.resolve({ status: 1, error_code: 0, msg: 'dfid cached' })
    }
    if (!devPromise) {
      devPromise = originalGet.apply(this, args).then(res => {
        localStorage.setItem('kg_desktop_has_dfid', 'true')
        return res
      }).catch(err => {
        devPromise = null
        throw err
      }).finally(() => {
        setTimeout(() => { devPromise = null }, 2000)
      })
    }
    return devPromise
  }
  return originalGet.apply(this, args)
}

export default request

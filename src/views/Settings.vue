<template>
  <div class="h-full flex flex-col overflow-y-auto pb-20">
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-2xl font-extrabold">设置</h1>
    </div>

    <div class="px-4 space-y-1">
      <!-- API 服务器地址 -->
      <div class="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4">
        <label class="text-xs font-bold text-gray-500 mb-2 block">API 服务器地址</label>
        <input 
          v-model="apiBase"
          @blur="saveApiBase"
          type="text"
          placeholder="http://192.168.1.x:3000"
          class="w-full h-10 bg-white dark:bg-slate-900 rounded-lg px-3 text-sm outline-none border border-gray-200 dark:border-slate-700 focus:border-blue-300"
        />
        <p class="text-[10px] text-gray-400 mt-1.5">指向概念音乐后端服务器</p>
      </div>

      <!-- 主题 -->
      <div class="flex items-center justify-between px-3 py-3 rounded-xl dark:active:bg-slate-800 tap-active">
        <span class="text-sm">深色模式</span>
        <button @click="toggleDark" class="w-11 h-6 rounded-full transition-colors relative" :class="isDark ? 'bg-blue-500' : 'bg-gray-300'">
          <span class="w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform" :class="isDark ? 'translate-x-[22px]' : 'translate-x-0.5'" />
        </button>
      </div>

      <!-- 音质 -->
      <div class="flex items-center justify-between px-3 py-3 rounded-xl dark:active:bg-slate-800 tap-active" @click="cycleQuality">
        <span class="text-sm">默认音质</span>
        <span class="text-xs text-gray-400">{{ qualityLabel }}</span>
      </div>

      <!-- 版本 -->
      <div class="flex items-center justify-between px-3 py-3 rounded-xl">
        <span class="text-sm">版本</span>
        <span class="text-xs text-gray-400">概念音乐 APK v1.0.0</span>
      </div>

      <!-- 关于 -->
      <div class="flex items-center justify-between px-3 py-3 rounded-xl dark:active:bg-slate-800 tap-active">
        <span class="text-sm">关于概念音乐</span>
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setApiBase, getApiBase } from '../utils/request'
import { usePlayerStore, QUALITY_CONFIG } from '../store/playerStore'

const player = usePlayerStore()
const apiBase = ref(getApiBase())
const isDark = ref(document.documentElement.classList.contains('dark'))

const qualityLabel = computed(() => {
  return QUALITY_CONFIG.find(q => q.key === player.currentQuality)?.name || '标准'
})

const saveApiBase = () => {
  const val = apiBase.value.trim()
  if (val) setApiBase(val)
}

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('cm_dark_mode', isDark.value ? 'true' : 'false')
}

const cycleQuality = () => {
  const keys = QUALITY_CONFIG.map(q => q.key)
  const idx = keys.indexOf(player.currentQuality)
  player.switchQuality(keys[(idx + 1) % keys.length])
}

// 初始化暗色模式
if (localStorage.getItem('cm_dark_mode') === 'true') {
  document.documentElement.classList.add('dark')
  isDark.value = true
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full sm:w-[360px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 safe-bottom shadow-2xl">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold">登录概念音乐</h2>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <p class="text-sm text-gray-500 mb-6">登录后将获得每日推荐、同步收藏等完整功能</p>

      <!-- 手机号登录 -->
      <div class="space-y-3 mb-6">
        <div class="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3">
          <svg class="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          <input 
            v-model="phone" 
            type="tel" 
            placeholder="输入手机号"
            class="flex-1 bg-transparent text-sm outline-none dark:text-slate-100"
            maxlength="11"
          />
        </div>

        <div class="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3">
          <svg class="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <input 
            v-model="password" 
            type="password" 
            placeholder="输入密码（可选）"
            class="flex-1 bg-transparent text-sm outline-none dark:text-slate-100"
          />
        </div>
      </div>

      <button 
        @click="handleLogin"
        class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/40"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <p class="text-[10px] text-gray-400 text-center mt-4">
        登录即表示同意服务条款与隐私政策
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../store/userStore'

const emit = defineEmits(['close'])
const userStore = useUserStore()
const phone = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!phone.value || phone.value.length < 11) {
    return
  }
  loading.value = true
  try {
    // 简化登录流程 — 实际接入完整API
    userStore.setLoggedIn({
      nickname: '用户' + phone.value.slice(-4),
      avatar: '',
      vip: 0
    })
    emit('close')
  } catch (e) {
    console.error('Login error', e)
  } finally {
    loading.value = false
  }
}
</script>

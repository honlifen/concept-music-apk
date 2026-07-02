<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div class="px-4 pt-4 pb-2 flex items-center justify-between">
      <h1 class="text-2xl font-extrabold">我的音乐</h1>
      <button @click="$router.push('/settings')" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center tap-scale">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </button>
    </div>

    <!-- 未登录 -->
    <div v-if="!userStore.isLoggedIn" class="flex-1 flex flex-col items-center justify-center px-6 pb-20">
      <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
      </div>
      <p class="text-sm font-bold mb-1">登录解锁完整功能</p>
      <p class="text-xs text-gray-400 mb-4 text-center">同步你的收藏歌单和历史记录</p>
      <button @click="userStore.openLoginModal()" class="px-8 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md tap-scale">立即登录</button>
    </div>

    <!-- 已登录 -->
    <div v-else class="px-4 pb-20">
      <!-- 用户卡片 -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl p-4 mb-5 flex items-center gap-3 border border-blue-100/30">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0">
          <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" class="w-full h-full object-cover" />
          <svg v-else class="w-full h-full text-gray-300 p-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-bold">{{ userStore.userInfo?.nickname || '用户' }}</p>
          <p class="text-[11px] text-gray-500">{{ userStore.vipLevelName }}</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-500 font-bold" v-if="userStore.userInfo?.vip">VIP</span>
      </div>

      <!-- 功能模块 -->
      <div class="space-y-1">
        <div 
          v-for="item in menuItems" :key="item.path"
          @click="$router.push(item.path)"
          class="flex items-center px-3 py-3 rounded-xl active:bg-gray-50 dark:active:bg-slate-800 gap-3 tap-active"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="item.bg">
            <svg class="w-4.5 h-4.5" :class="item.color" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" v-html="item.icon" />
          </div>
          <span class="text-sm flex-1">{{ item.label }}</span>
          <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </div>

      <!-- 退出 -->
      <button @click="userStore.logout()" class="w-full mt-6 py-3 text-sm text-red-500 font-medium active:text-red-700 tap-scale">
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()

const menuItems = [
  { path: '/liked', label: '我喜欢的音乐', bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>' },
  { path: '/history', label: '听歌足迹', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { path: '/rank', label: '排行榜', bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>' },
  { path: '/fm', label: '私人FM', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>' },
]
</script>

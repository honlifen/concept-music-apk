<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-2xl font-extrabold flex items-center gap-2">
        <span>❤️</span> 我喜欢的音乐
      </h1>
    </div>

    <div v-if="!userStore.isLoggedIn" class="flex-1 flex flex-col items-center justify-center pb-20">
      <p class="text-sm text-gray-400">登录后可查看喜欢的音乐</p>
      <button @click="userStore.openLoginModal()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold tap-scale">立即登录</button>
    </div>

    <div v-else-if="userStore.likedHashes.length === 0" class="flex-1 flex flex-col items-center justify-center pb-20 text-gray-400">
      <svg class="w-12 h-12 mb-3 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <p class="text-sm">还没有喜欢的歌曲</p>
    </div>

    <div v-else class="px-3 pb-20">
      <p class="px-1 py-2 text-xs text-gray-400">{{ userStore.likedHashes.length }} 首歌曲</p>
      <div class="divide-y divide-gray-50 dark:divide-slate-800/50">
        <div 
          v-for="hash in userStore.likedHashes" :key="hash"
          class="flex items-center px-1 py-2.5 gap-3 rounded-lg active:bg-gray-50 tap-active"
        >
          <div class="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
            <svg class="w-4 h-4 text-red-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ hash }}</p>
          </div>
          <button @click="userStore.likedHashes = userStore.likedHashes.filter(h => h !== hash)" class="text-gray-300 active:text-red-500 p-1 tap-scale">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore'
const userStore = useUserStore()
</script>

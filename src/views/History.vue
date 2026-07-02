<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-2xl font-extrabold">听歌足迹</h1>
      <p class="text-xs text-gray-400 mt-1" v-if="userStore.isLoggedIn">记录了你的听歌历史</p>
    </div>

    <div v-if="!userStore.isLoggedIn" class="flex-1 flex flex-col items-center justify-center pb-20">
      <p class="text-sm text-gray-400">登录后可查看听歌历史</p>
      <button @click="userStore.openLoginModal()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold tap-scale">立即登录</button>
    </div>

    <div v-else-if="history.length === 0" class="flex-1 flex flex-col items-center justify-center pb-20 text-gray-400">
      <svg class="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <p class="text-sm">还没有听过歌</p>
    </div>

    <div v-else class="px-3 pb-20">
      <div class="divide-y divide-gray-50 dark:divide-slate-800/50">
        <div 
          v-for="(song, idx) in history" :key="song._hash || idx"
          @click="player.playSong(song)"
          class="flex items-center px-1 py-2.5 gap-3 rounded-lg active:bg-gray-50 dark:active:bg-slate-800 tap-active"
        >
          <div class="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img v-if="song._cover" :src="song._cover" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ song._title }}</p>
            <p class="text-xs text-gray-400 truncate">{{ song._singer }}</p>
          </div>
          <span class="text-[10px] text-gray-300 dark:text-slate-600 flex-shrink-0" v-if="song._playCount">{{ song._playCount }}次</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/userStore'
import { usePlayerStore } from '../store/playerStore'

const userStore = useUserStore()
const player = usePlayerStore()

const history = computed(() => {
  return userStore.localHistory.map(h => ({
    ...h,
    _playCount: userStore.localPlayCounts[(h._hash || '').toUpperCase()] || 1,
  }))
})
</script>

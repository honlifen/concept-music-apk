<template>
  <div class="h-full flex flex-col items-center justify-center overflow-y-auto pb-20">
    <!-- FM 唱片机风格 -->
    <div class="flex-1 flex flex-col items-center justify-center w-full px-6">
      <div class="relative w-56 h-56 sm:w-64 sm:h-64 mb-8">
        <div 
          class="w-full h-full rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-900/40 dark:to-indigo-900/40 shadow-2xl flex items-center justify-center"
          :class="{ 'animate-spin': player.isPlaying }"
          style="animation-duration: 4s"
        >
          <div class="w-[60%] h-[60%] rounded-full bg-gray-900 overflow-hidden shadow-inner">
            <img v-if="currentSong?.cover" :src="currentSong.cover" class="w-full h-full object-cover" />
            <svg v-else class="w-full h-full text-gray-600 p-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div class="absolute w-5 h-5 bg-white rounded-full shadow-lg" />
        </div>
      </div>

      <!-- 歌曲信息 -->
      <div class="text-center mb-6 w-full max-w-xs">
        <h2 class="text-lg font-bold truncate" v-if="currentSong">{{ currentSong.name }}</h2>
        <p class="text-sm text-gray-400 mt-1" v-if="currentSong">{{ currentSong.singer }}</p>
        <p class="text-gray-400 text-sm" v-else>私人FM · 发现你的专属好歌</p>
      </div>

      <!-- 进度 -->
      <div class="flex items-center gap-3 w-full max-w-xs mb-8">
        <span class="text-[11px] text-gray-400 w-10 text-right font-mono">{{ formatTime(player.currentTime) }}</span>
        <div class="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-purple-500 rounded-full" :style="{ width: player.progress + '%' }" />
        </div>
        <span class="text-[11px] text-gray-400 w-10 font-mono">{{ formatTime(player.duration) }}</span>
      </div>

      <!-- 控件 -->
      <div class="flex items-center gap-8">
        <button @click="dislike" class="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-red-400 active:bg-red-50 active:text-red-500 tap-scale shadow-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <button @click="player.togglePlay()" class="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200 tap-scale active:scale-95">
          <svg v-if="player.isLoading" class="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg v-else-if="player.isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd"/></svg>
          <svg v-else class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd"/></svg>
        </button>

        <button @click="like" class="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 active:bg-red-50 active:text-red-500 tap-scale shadow-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="px-4 pb-4 text-center">
      <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
      <p v-else-if="loading" class="text-xs text-gray-400">正在为你推荐...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'
import { usePlayerStore } from '../store/playerStore'
import { useUserStore } from '../store/userStore'

const player = usePlayerStore()
const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const fmSongs = ref([])
const fmIndex = ref(0)

const currentSong = computed(() => fmSongs.value[fmIndex.value] || null)

const formatTime = (s) => {
  if (!s || !isFinite(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const fetchFM = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await request.get('/personal_fm', { silent: true })
    const songs = (res?.data?.song_list || res?.data || []).map(s => ({
      hash: s.FileHash || s.hash || s.extramixhash || '',
      name: s.SongName || s.songname || s.name || s.title || '',
      singer: s.SingerName || s.singername || s.singer || '',
      cover: s.Cover || s.cover || s.img || '',
    })).filter(s => s.hash)
    fmSongs.value = songs
    if (songs.length > 0) {
      fmIndex.value = 0
      player.playSong(songs[0])
    }
  } catch (e) {
    error.value = '获取推荐失败，请稍后重试'
  }
  finally { loading.value = false }
}

const like = () => {
  if (currentSong.value) {
    userStore.toggleLikeSong(currentSong.value)
    player.showToast('已加入我喜欢 ❤️')
  }
  nextFM()
}

const dislike = () => {
  nextFM()
}

const nextFM = () => {
  if (fmIndex.value < fmSongs.value.length - 1) {
    fmIndex.value++
    player.playSong(fmSongs.value[fmIndex.value])
  } else {
    fetchFM()
  }
}

// 监听播放结束，自动切歌
const checkNext = () => {
  if (!player.isPlaying && player.currentTime >= player.duration - 0.5 && player.duration > 0) {
    nextFM()
  }
}

onMounted(() => {
  fetchFM()
  setInterval(checkNext, 2000)
})
</script>

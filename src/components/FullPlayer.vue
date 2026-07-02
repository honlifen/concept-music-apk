<template>
  <div class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950" @click.self="player.toggleFullPlayer()">
    
    <!-- 顶部栏 -->
    <div class="h-12 flex items-center justify-between px-4 shrink-0 safe-top">
      <button @click="player.toggleFullPlayer()" class="w-8 h-8 flex items-center justify-center text-gray-500 tap-scale">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <span class="text-xs text-gray-400 font-medium">正在播放</span>
      <button @click="$router.push('/settings')" class="w-8 h-8 flex items-center justify-center text-gray-400 tap-scale">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/></svg>
      </button>
    </div>

    <!-- 唱片区域 -->
    <div class="flex-1 flex items-center justify-center px-8 overflow-hidden">
      <div class="relative w-full max-w-[320px] aspect-square">
        <!-- 旋转唱片 -->
        <div 
          class="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden"
          :style="{ transform: `rotate(${rotation}deg)`, transition: player.isPlaying ? 'none' : 'transform 0.5s ease-out' }"
        >
          <div class="absolute inset-[15%] rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden bg-gray-900">
            <img 
              v-if="player.currentSong?.cover" 
              :src="player.currentSong.cover" 
              class="w-full h-full object-cover rounded-full"
              @error="e => e.target.src = ''"
            />
            <svg v-else class="w-1/3 h-1/3 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div class="absolute w-4 h-4 bg-white dark:bg-slate-200 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-10" />
        </div>
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="px-6 pb-2 text-center">
      <div class="flex items-center justify-center gap-2">
        <h2 class="text-lg font-bold truncate">{{ player.currentSong?.name || '未在播放' }}</h2>
        <span v-if="player.currentSong?.is_vip" class="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-bold flex-shrink-0">VIP</span>
      </div>
      <p class="text-sm text-gray-400 mt-1">{{ player.currentSong?.singer || '' }}</p>
    </div>

    <!-- 进度条 -->
    <div class="px-6 py-2">
      <div class="flex items-center gap-3">
        <span class="text-[11px] text-gray-400 w-10 text-right font-mono">{{ formatTime(player.currentTime) }}</span>
        <div class="flex-1 relative h-8 flex items-center" @click="seekByTouch">
          <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full transition-all duration-200" :style="{ width: player.progress + '%' }" />
          </div>
          <div class="absolute w-4 h-4 bg-blue-500 rounded-full shadow-md -ml-2" :style="{ left: player.progress + '%' }" />
        </div>
        <span class="text-[11px] text-gray-400 w-10 font-mono">{{ formatTime(player.duration) }}</span>
      </div>
    </div>

    <!-- 控件 -->
    <div class="flex items-center justify-center gap-10 px-6 py-3">
      <button @click="player.togglePlayMode()" class="w-8 h-8 flex items-center justify-center tap-scale"
        :class="player.playMode === 'sequence' ? 'text-gray-400' : player.playMode === 'loop' ? 'text-blue-500' : 'text-purple-500'">
        <svg v-if="player.playMode === 'sequence'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14m-7 15-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3"/></svg>
        <svg v-else-if="player.playMode === 'loop'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-3 3-3-3"/></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m18 14 4 4-4 4M18 2l4 4-4 4M2 18h1.5a5 5 0 0 0 4-2l5-8a5 5 0 0 1 4-2H22"/></svg>
      </button>

      <button @click="player.playPrev()" class="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 tap-scale">
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/></svg>
      </button>

      <button @click="player.togglePlay()" class="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40 tap-scale transition-all">
        <svg v-if="player.isLoading" class="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <svg v-else-if="player.isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd"/></svg>
        <svg v-else class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd"/></svg>
      </button>

      <button @click="player.playNext(false)" class="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 tap-scale">
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 5.168A1 1 0 0010 6v2.798l-5.445-3.63A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z"/></svg>
      </button>

      <button @click="showPlaylist = !showPlaylist" class="w-8 h-8 flex items-center justify-center tap-scale" :class="showPlaylist ? 'text-blue-500' : 'text-gray-400'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>
      </button>
    </div>

    <!-- 音量 -->
    <div class="flex items-center justify-center gap-3 px-8 py-2">
      <button @click="player.toggleMute()" class="text-gray-400 tap-scale">
        <svg v-if="player.volume === 0" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
        <svg v-else-if="player.volume < 0.5" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
      </button>
      <div class="flex-1 h-8 flex items-center max-w-[200px]">
        <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
          <div class="h-full bg-blue-500 rounded-full" :style="{ width: (player.volume * 100) + '%' }" />
          <input 
            type="range" min="0" max="1" step="0.01" :value="player.volume"
            @input="e => player.setVolume(Number(e.target.value))"
            class="absolute inset-0 opacity-0 w-full h-full"
          />
        </div>
      </div>
    </div>

    <!-- 播放列表面板 -->
    <transition name="sheet">
      <div v-if="showPlaylist" class="absolute inset-x-0 bottom-0 top-12 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl flex flex-col rounded-t-3xl z-10 shadow-2xl">
        <div class="h-12 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800">
          <span class="text-sm font-bold">播放队列 ({{ player.playlist.length }})</span>
          <button @click="player.clearPlaylist()" class="text-xs text-gray-400 active:text-red-500">清空</button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="player.playlist.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg class="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19a2 2 0 11-4 0 2 2 0 014 0zm12-3a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <p class="text-xs">暂无歌曲</p>
          </div>
          <div v-else class="py-2">
            <div 
              v-for="(song, idx) in player.playlist" :key="song.hash + '_' + idx"
              @click="player.playSong(song); showPlaylist = false"
              class="flex items-center px-4 py-2.5 active:bg-gray-50 dark:active:bg-slate-800 gap-3"
              :class="player.currentSong?.hash === song.hash ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''"
            >
              <span class="text-xs w-6 text-center font-medium"
                :class="player.currentSong?.hash === song.hash ? 'text-blue-500' : 'text-gray-400'">{{ idx + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate" :class="player.currentSong?.hash === song.hash ? 'text-blue-600' : ''">{{ song.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ song.singer }}</p>
              </div>
              <button @click.stop="player.removeFromPlaylist(idx)" class="text-gray-300 active:text-red-500 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../store/playerStore'
import { useRouter } from 'vue-router'

const player = usePlayerStore()
const router = useRouter()
const showPlaylist = ref(false)
const rotation = ref(0)
let animFrame = null
let lastTime = 0
let speed = 0
const RPM = 360 / 20
const FRICTION = 0.985

function formatTime(s) {
  if (!s || !isFinite(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function seekByTouch(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  const time = pct * player.duration
  player.seekTo(time)
}

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1)
  lastTime = timestamp
  if (player.isPlaying) {
    speed = RPM
  } else {
    speed *= Math.pow(FRICTION, dt * 60)
    if (speed < 0.1) { speed = 0; lastTime = 0; animFrame = null; return }
  }
  rotation.value = (rotation.value + speed * dt) % 360
  animFrame = requestAnimationFrame(animate)
}

onMounted(() => { animFrame = requestAnimationFrame(animate) })
onUnmounted(() => { if (animFrame) cancelAnimationFrame(animFrame) })
</script>

<style scoped>
.sheet-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active { transition: transform 0.2s ease-in; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>

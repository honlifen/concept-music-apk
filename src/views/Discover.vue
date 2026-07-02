<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <!-- 顶部问候 -->
    <div class="px-4 pt-4 pb-2 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold">
          概念音乐
          <span class="text-base text-blue-500 font-bold ml-2">APK</span>
        </h1>
        <p class="text-xs text-gray-400 mt-1" v-if="userStore.isLoggedIn">
          下午好，{{ userStore.userInfo?.nickname || '用户' }}
        </p>
        <p class="text-xs text-gray-400 mt-1" v-else>
          听见好时光，发现未知的旋律
        </p>
      </div>
      <button 
        @click="userStore.isLoggedIn ? null : userStore.openLoginModal()"
        class="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0"
      >
        <img v-if="userStore.isLoggedIn && userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" class="w-full h-full object-cover" />
        <svg v-else class="w-full h-full text-gray-400 p-1.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
      </button>
    </div>

    <!-- 快捷入口 -->
    <div class="px-4 py-3 grid grid-cols-4 gap-2">
      <div 
        v-for="entry in quickEntries" :key="entry.path"
        @click="$router.push(entry.path)"
        class="flex flex-col items-center gap-1 py-3 rounded-xl active:bg-gray-50 dark:active:bg-slate-800 tap-scale"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="entry.bg">
          <svg class="w-5 h-5" :class="entry.color" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="entry.icon" />
        </div>
        <span class="text-[11px] text-gray-600 dark:text-gray-400">{{ entry.label }}</span>
      </div>
    </div>

    <!-- 每日推荐 -->
    <div class="px-4 mb-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold flex items-center gap-1.5">
          <span>🎧</span> 每日推荐
        </h3>
        <button v-if="userStore.isLoggedIn && dailySongs.length > 0" @click="playAllDaily" class="text-xs text-blue-500 font-bold active:text-blue-700 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
          播放全部
        </button>
      </div>

      <!-- 未登录 -->
      <div v-if="!userStore.isLoggedIn" @click="userStore.openLoginModal()" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl p-6 flex flex-col items-center text-center border border-blue-100/50">
        <p class="text-sm font-bold mb-1">解锁私人推荐</p>
        <p class="text-xs text-gray-500 mb-3">登录后获取专属每日推荐</p>
        <span class="px-6 py-2 bg-blue-600 text-white rounded-full text-xs font-bold shadow">立即登录</span>
      </div>

      <!-- 骨架屏 -->
      <div v-else-if="isDailyLoading" class="grid grid-cols-2 gap-2">
        <div v-for="i in 6" :key="i" class="flex items-center p-2 bg-gray-50 rounded-xl gap-2">
          <div class="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div class="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>

      <!-- 歌曲列表 -->
      <div v-else-if="dailySongs.length > 0" class="grid grid-cols-2 gap-2">
        <div 
          v-for="song in dailySongs.slice(0, 6)" :key="song._hash"
          @click="handlePlay(song)"
          class="flex items-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-xl active:bg-gray-100 dark:active:bg-slate-800 gap-2 tap-active"
        >
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
            <img v-if="song._cover" :src="song._cover" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ song._title }}</p>
            <p class="text-[11px] text-gray-400 truncate">{{ song._singer }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 精选歌单 -->
    <div class="px-4 mb-20">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold flex items-center gap-1.5"><span>💿</span> 精选歌单</h3>
        <button @click="$router.push('/explore')" class="text-xs text-blue-500 font-bold">更多</button>
      </div>

      <div v-if="isPlaylistsLoading" class="grid grid-cols-3 gap-3">
        <div v-for="i in 6" :key="i" class="space-y-2">
          <div class="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div class="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
        </div>
      </div>

      <div v-else class="grid grid-cols-3 gap-3">
        <div 
          v-for="pl in playlists.slice(0, 9)" :key="pl.global_collection_id || pl.specialid"
          @click="goToPlaylist(pl.global_collection_id || pl.specialid)"
          class="flex flex-col tap-scale"
        >
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm relative">
            <img :src="formatImg(pl.imgurl || pl.flexible_cover || pl.pic)" class="w-full h-full object-cover" />
            <div class="absolute top-1.5 right-1.5 bg-black/30 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              {{ formatPlayCount(pl.play_count) }}
            </div>
          </div>
          <h4 class="text-xs font-medium mt-1.5 line-clamp-2 leading-snug">{{ pl.specialname }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { useUserStore } from '../store/userStore'
import { usePlayerStore } from '../store/playerStore'

const router = useRouter()
const userStore = useUserStore()
const player = usePlayerStore()

const isPlaylistsLoading = ref(true)
const playlists = ref([])
const isDailyLoading = ref(false)
const dailySongs = ref([])

const quickEntries = [
  { path: '/fm', label: '私人FM', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>' },
  { path: '/rank', label: '排行榜', bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>' },
  { path: '/new-songs', label: '新歌', bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>' },
  { path: '/history', label: '足迹', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
]

const formatPlayCount = (n) => {
  if (!n) return '0'
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

const formatImg = (url) => {
  if (!url) return ''
  return String(url).replace(/\{size\}/g, '400')
}

const fetchPlaylists = async () => {
  isPlaylistsLoading.value = true
  try {
    const res = await request.get('/top/playlist', { params: { category_id: 0 }, silent: true })
    if (res?.data?.special_list) playlists.value = res.data.special_list
  } catch (e) { console.error('[Discover] playlists:', e.message) }
  finally { isPlaylistsLoading.value = false }
}

const fetchDailyRecommend = async () => {
  if (!userStore.isLoggedIn) return
  isDailyLoading.value = true
  try {
    const res = await request.get('/everyday/recommend', { silent: true })
    const rawSongs = res?.data?.song_list || []
    dailySongs.value = rawSongs.slice(0, 6).map(s => ({
      _hash: s.hash || s.FileHash || '',
      _title: s.songname || s.name || '',
      _singer: s.singername || s.singer || '',
      _cover: s.cover || s.img || '',
    }))
  } catch (e) { console.error('[Discover] daily:', e.message) }
  finally { isDailyLoading.value = false }
}

const goToPlaylist = (id) => { if (id) router.push(`/playlist/${id}`) }

const handlePlay = (song) => {
  if (!song._hash) return
  player.playSong(song)
}

const playAllDaily = () => {
  player.prependPlaylistAndPlay(dailySongs.value)
}

watch(() => userStore.isLoggedIn, (v) => { if (v) fetchDailyRecommend() })

onMounted(() => {
  fetchPlaylists()
  if (userStore.isLoggedIn) fetchDailyRecommend()
})
</script>

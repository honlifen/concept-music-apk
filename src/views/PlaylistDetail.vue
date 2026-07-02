<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <!-- 歌单头部 -->
    <div v-if="info" class="relative">
      <div class="h-48 bg-gradient-to-b from-blue-100 to-white dark:from-blue-950/30 dark:to-slate-950 flex items-end p-4">
        <div class="flex gap-4 items-end">
          <div class="w-28 h-28 rounded-2xl overflow-hidden shadow-xl bg-gray-200 flex-shrink-0 border-2 border-white/80">
            <img :src="formatImg(info.imgurl || info.flexible_cover)" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0 pb-1">
            <h2 class="text-lg font-extrabold leading-snug line-clamp-2">{{ info.specialname }}</h2>
            <p class="text-xs text-gray-500 mt-1">By {{ info.nickname || '未知' }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ formatPlayCount(info.play_count) }} 次播放</p>
          </div>
        </div>
      </div>

      <!-- 全部播放 -->
      <div class="px-4 py-3 flex items-center gap-3">
        <button @click="playAll" class="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-200 tap-scale active:scale-95">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
          播放全部
        </button>
        <span class="text-xs text-gray-400">{{ songs.length }} 首</span>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="px-3 pb-20 flex-1">
      <div v-if="loading" class="space-y-3 py-4">
        <div v-for="i in 10" :key="i" class="flex items-center gap-3 p-2">
          <div class="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div class="h-2 bg-gray-50 rounded animate-pulse w-1/3" />
          </div>
        </div>
      </div>

      <div v-else class="divide-y divide-gray-50 dark:divide-slate-800/50">
        <div 
          v-for="(song, idx) in songs" :key="song.hash || idx"
          @click="player.playSong(song)"
          class="flex items-center px-1 py-2.5 gap-3 rounded-lg active:bg-gray-50 dark:active:bg-slate-800 tap-active"
        >
          <span class="w-6 text-center text-xs text-gray-400 flex-shrink-0">{{ idx + 1 }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-medium truncate">{{ song.name || song.songname }}</p>
              <span v-if="song.is_vip" class="text-[8px] px-1 rounded bg-blue-50 text-blue-500 font-bold flex-shrink-0">VIP</span>
            </div>
            <p class="text-xs text-gray-400 truncate">{{ song.singer || song.singername }}</p>
          </div>
          <button @click.stop="player.addToPlaylist(song)" class="text-gray-300 active:text-blue-500 p-1 tap-scale">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
        </div>
      </div>

      <div v-if="!loading && songs.length === 0" class="flex flex-col items-center py-16 text-gray-400">
        <p class="text-sm">暂无歌曲</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '../utils/request'
import { usePlayerStore } from '../store/playerStore'

const route = useRoute()
const player = usePlayerStore()
const info = ref(null)
const songs = ref([])
const loading = ref(true)

const formatImg = (url) => {
  if (!url) return ''
  return String(url).replace(/\{size\}/g, '400')
}

const formatPlayCount = (n) => {
  if (!n) return '0'
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

const fetchDetail = async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  try {
    const res = await request.get('/playlist/detail', { params: { id, page: 1, pagesize: 50 }, silent: true })
    if (res?.data) {
      info.value = res.data
      songs.value = (res.data.song_list || []).map(s => ({
        hash: s.FileHash || s.filehash || s.hash || '',
        name: s.SongName || s.songname || s.name || '',
        singer: s.SingerName || s.singername || s.singer || '',
        cover: s.Cover || s.cover || '',
        album: s.AlbumName || s.album || '',
        album_id: s.AlbumID || s.album_id || '',
        is_vip: s.is_vip || s.IsVip || false,
      })).filter(s => s.hash)
    }
  } catch (e) { console.error('[Playlist]', e.message) }
  finally { loading.value = false }
}

const playAll = () => {
  if (songs.value.length) player.prependPlaylistAndPlay(songs.value)
}

onMounted(() => fetchDetail())
</script>

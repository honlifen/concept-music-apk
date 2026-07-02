<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-2xl font-extrabold flex items-center gap-2">
        <span>⚡</span> 新歌速递
      </h1>
    </div>

    <div v-if="loading" class="px-3 space-y-3">
      <div v-for="i in 8" :key="i" class="flex items-center gap-3 p-2">
        <div class="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div class="flex-1 space-y-1.5"><div class="h-3 bg-gray-100 rounded animate-pulse w-2/3" /><div class="h-2 bg-gray-50 rounded animate-pulse w-1/3" /></div>
      </div>
    </div>

    <div v-else class="px-3 pb-20">
      <div class="divide-y divide-gray-50 dark:divide-slate-800/50">
        <div 
          v-for="(song, idx) in songs" :key="song.hash || idx"
          @click="player.playSong(song)"
          class="flex items-center px-1 py-2.5 gap-3 rounded-lg active:bg-gray-50 dark:active:bg-slate-800 tap-active"
        >
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
            <img v-if="song.cover" :src="song.cover" class="w-full h-full object-cover" />
            <span v-else class="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">NEW</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ song.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ song.singer }} {{ song.album ? '· ' + song.album : '' }}</p>
          </div>
          <button @click.stop="player.addToPlaylist(song)" class="text-gray-300 active:text-blue-500 p-1 tap-scale">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
        </div>
      </div>

      <div v-if="songs.length === 0" class="flex flex-col items-center py-16 text-gray-400">
        <p class="text-sm">暂无新歌数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { usePlayerStore } from '../store/playerStore'

const player = usePlayerStore()
const songs = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await request.get('/new/songs', { params: { typeid: 0, page: 1, pagesize: 30 }, silent: true })
    const data = res?.data || {}
    songs.value = (data.song_list || data.songs || data.data || []).map(s => ({
      hash: s.FileHash || s.hash || s.extramixhash || '',
      name: s.SongName || s.songname || s.name || s.title || '',
      singer: s.SingerName || s.singername || s.singer || '',
      cover: s.Cover || s.cover || s.img || '',
      album: s.AlbumName || s.album || '',
      album_id: s.AlbumID || s.album_id || '',
    })).filter(s => s.hash)
  } catch (e) { console.error('[NewSongs]', e.message) }
  finally { loading.value = false }
})
</script>

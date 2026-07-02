<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <!-- 歌手头部 -->
    <div v-if="info" class="relative">
      <div class="h-52 bg-gradient-to-b from-purple-100 to-white dark:from-purple-950/30 dark:to-slate-950 flex flex-col items-center justify-end p-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-center bg-cover opacity-25 blur-2xl scale-125" :style="info.pic ? { backgroundImage: `url(${formatImg(info.pic)})` } : {}" />
        <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 shadow-xl border-3 border-white/80 z-10">
          <img v-if="info.pic" :src="formatImg(info.pic)" class="w-full h-full object-cover" />
          <svg v-else class="w-full h-full text-gray-300 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        <h2 class="text-xl font-extrabold mt-3 z-10">{{ info.name }}</h2>
        <p class="text-xs text-gray-500 mt-1 z-10">{{ songs.length }} 首热门歌曲</p>
      </div>

      <div class="px-4 py-3 flex items-center gap-3">
        <button @click="playAll" class="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white rounded-full text-sm font-bold shadow-lg shadow-purple-200 tap-scale active:scale-95">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
          播放热门
        </button>
      </div>
    </div>

    <div class="px-3 pb-20">
      <div v-if="loading" class="space-y-3 py-2">
        <div v-for="i in 10" :key="i" class="flex items-center gap-3 p-2">
          <div class="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div class="flex-1 space-y-1.5"><div class="h-3 bg-gray-100 rounded animate-pulse w-2/3" /><div class="h-2 bg-gray-50 rounded animate-pulse w-1/3" /></div>
        </div>
      </div>
      <div v-else class="divide-y divide-gray-50 dark:divide-slate-800/50">
        <div 
          v-for="(song, idx) in songs" :key="song.hash || idx"
          @click="player.playSong(song)"
          class="flex items-center px-1 py-2.5 gap-3 rounded-lg active:bg-gray-50 tap-active"
        >
          <span class="w-6 text-center text-xs text-gray-400 flex-shrink-0">{{ idx + 1 }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ song.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ song.album || '' }}</p>
          </div>
        </div>
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

onMounted(async () => {
  const id = route.params.id
  if (!id) { loading.value = false; return }
  try {
    const res = await request.get('/artist/info', { params: { singerid: id, page: 1, pagesize: 30 }, silent: true })
    const data = res?.data || {}
    info.value = {
      name: data.singername || data.name || '',
      pic: data.imgurl || data.pic || '',
    }
    songs.value = (data.song_list || data.songs || []).map(s => ({
      hash: s.FileHash || s.hash || s.extramixhash || '',
      name: s.SongName || s.songname || s.name || s.title || '',
      singer: info.value.name,
      cover: s.Cover || s.cover || '',
      album: s.AlbumName || s.album || '',
      album_id: s.AlbumID || s.album_id || '',
    })).filter(s => s.hash)
  } catch (e) { console.error('[ArtistDetail]', e.message) }
  finally { loading.value = false }
})

const playAll = () => {
  if (songs.value.length) player.prependPlaylistAndPlay(songs.value)
}
</script>

<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div v-if="info" class="relative">
      <div class="h-40 bg-gradient-to-b from-orange-100 to-white dark:from-orange-950/30 dark:to-slate-950 flex items-end p-4">
        <div class="flex gap-4 items-end">
          <div class="w-24 h-24 rounded-2xl overflow-hidden shadow-xl bg-gray-200 flex-shrink-0 border-2 border-white/80">
            <img :src="formatImg(info.pic)" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0 pb-1">
            <h2 class="text-lg font-extrabold">{{ info.name }}</h2>
            <p class="text-xs text-gray-500 mt-1">更新于 {{ info.update_time || '' }}</p>
          </div>
        </div>
      </div>

      <div class="px-4 py-3 flex items-center gap-3">
        <button @click="playAll" class="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-200 tap-scale active:scale-95">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
          播放全部
        </button>
      </div>
    </div>

    <div class="px-3 pb-20">
      <div v-if="loading" class="space-y-3 py-2">
        <div v-for="i in 10" :key="i" class="flex items-center gap-3 p-2">
          <div class="w-8 h-3 bg-gray-100 rounded animate-pulse" />
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
          <span class="w-7 text-center text-xs font-bold flex-shrink-0" :class="idx < 3 ? 'text-orange-500' : 'text-gray-400'">{{ idx + 1 }}</span>
          <div class="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img v-if="song.cover" :src="song.cover" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ song.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ song.singer }}</p>
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
    const res = await request.get('/rank/info', { params: { rankid: id, page: 1, pagesize: 30 }, silent: true })
    const data = res?.data || {}
    info.value = {
      name: data.rankname || data.name || '',
      pic: data.imgurl || data.banner7url || data.pic || '',
      update_time: data.update_time || '',
    }
    songs.value = (data.song_list || data.songs || []).map(s => ({
      hash: s.FileHash || s.filehash || s.hash || s.extramixhash || '',
      name: s.SongName || s.songname || s.name || s.title || '',
      singer: s.SingerName || s.singername || s.singer || '',
      cover: s.Cover || s.cover || s.album_img || '',
    })).filter(s => s.hash)
  } catch (e) { console.error('[RankDetail]', e.message) }
  finally { loading.value = false }
})

const playAll = () => {
  if (songs.value.length) player.prependPlaylistAndPlay(songs.value)
}
</script>

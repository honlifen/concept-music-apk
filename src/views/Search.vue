<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <!-- 搜索栏 -->
    <div class="px-4 pt-3 pb-1 sticky top-0 bg-white dark:bg-slate-950 z-10">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input 
          v-model="keyword"
          ref="searchInput"
          @focus="showSuggestions = true"
          @keydown.enter="doSearch"
          type="text"
          placeholder="搜索歌曲、歌手、歌单..."
          class="w-full h-10 bg-gray-100 dark:bg-slate-800 rounded-full pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all"
        />
        <button 
          v-if="keyword" 
          @click="keyword = ''; results = null"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center text-white"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- 搜索建议 / 热榜 -->
    <div v-if="!results && showSuggestions" class="px-4 flex-1">
      <!-- 搜索历史 -->
      <div v-if="history.length > 0 && !keyword" class="mb-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-bold text-gray-500">搜索历史</span>
          <button @click="clearHistory" class="text-xs text-gray-400 active:text-red-500">清空</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="(h, i) in history" :key="i"
            @click="keyword = h; doSearch()"
            class="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs text-gray-600 dark:text-gray-300 active:bg-blue-50 active:text-blue-600 tap-scale"
          >{{ h }}</span>
        </div>
      </div>

      <!-- 热搜榜 -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sm font-bold text-gray-500">🔥 热搜榜</span>
        </div>
        <div v-if="hotLoading" class="text-center text-xs text-gray-400 py-6">加载中...</div>
        <div v-else class="space-y-1">
          <div 
            v-for="(item, i) in hotList" :key="i"
            @click="keyword = item.word; doSearch()"
            class="flex items-center px-3 py-2.5 rounded-xl active:bg-gray-50 dark:active:bg-slate-800 tap-active"
          >
            <span class="w-6 text-sm font-bold flex-shrink-0" :class="i < 3 ? 'text-blue-500' : 'text-gray-400'">{{ i + 1 }}</span>
            <span class="text-sm flex-1 truncate" :class="i < 3 ? 'font-semibold' : ''">{{ item.word }}</span>
            <span v-if="item.score" class="text-[10px] text-gray-400 ml-2">{{ formatScore(item.score) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="results" class="px-4 pb-20 flex-1">
      <div v-if="searching" class="text-center text-xs text-gray-400 py-8">搜索中...</div>

      <template v-else>
        <!-- 歌曲 -->
        <div v-if="results.songs?.length" class="mb-6">
          <h3 class="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            歌曲
          </h3>
          <div 
            v-for="song in results.songs" :key="song.hash"
            @click="playSong(song)"
            class="flex items-center px-2 py-2.5 rounded-xl active:bg-gray-50 dark:active:bg-slate-800 gap-3 tap-active"
          >
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              <img v-if="song.cover" :src="song.cover" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ song.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ song.singer }}</p>
            </div>
            <button @click.stop="player.addToPlaylist(song)" class="text-gray-300 active:text-blue-500 p-1 tap-scale">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>
        </div>

        <!-- 歌手 -->
        <div v-if="results.artists?.length" class="mb-6">
          <h3 class="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            歌手
          </h3>
          <div 
            v-for="artist in results.artists" :key="artist.id"
            @click="$router.push(`/artist/${artist.id}`)"
            class="flex items-center px-2 py-2.5 rounded-xl active:bg-gray-50 dark:active:bg-slate-800 gap-3 tap-active"
          >
            <div class="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
              <img v-if="artist.pic" :src="artist.pic" class="w-full h-full object-cover" />
              <svg v-else class="w-full h-full text-gray-300 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">{{ artist.name }}</p>
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-if="!results.songs?.length && !results.artists?.length && !results.albums?.length" class="flex flex-col items-center py-16 text-gray-400">
          <svg class="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <p class="text-sm">未找到相关结果</p>
        </div>
      </template>
    </div>

    <!-- 默认 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-600 pb-20">
      <svg class="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      <p class="text-sm font-medium">搜索你喜欢的音乐</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { usePlayerStore } from '../store/playerStore'

const router = useRouter()
const player = usePlayerStore()

const keyword = ref('')
const searchInput = ref(null)
const showSuggestions = ref(true)
const results = ref(null)
const searching = ref(false)

const hotList = ref([])
const hotLoading = ref(false)
const history = ref(JSON.parse(localStorage.getItem('cm_search_history') || '[]'))

const addHistory = (kw) => {
  history.value = [kw, ...history.value.filter(h => h !== kw)].slice(0, 15)
  localStorage.setItem('cm_search_history', JSON.stringify(history.value))
}

const clearHistory = () => {
  history.value = []
  localStorage.removeItem('cm_search_history')
}

const formatScore = (s) => {
  if (!s) return ''
  if (s >= 10000) return (s / 10000).toFixed(1) + '万'
  return String(s)
}

const fetchHotList = async () => {
  hotLoading.value = true
  try {
    const res = await request.get('/search/hot', { silent: true })
    const d = res?.data
    const list = Array.isArray(d?.list) ? d.list : []
    let raw = []
    for (const tab of list) {
      if (Array.isArray(tab?.keywords) && tab.keywords.length > 0) { raw = tab.keywords; break }
    }
    hotList.value = raw.slice(0, 12).map(item => ({
      word: typeof item === 'string' ? item : (item.keyword || item.search_word || item.word || ''),
      score: item.score || item.heat || 0
    }))
  } catch (e) { console.error('[Search] hot:', e.message) }
  finally { hotLoading.value = false }
}

const doSearch = async () => {
  const kw = keyword.value.trim()
  if (!kw) return
  addHistory(kw)
  showSuggestions.value = false
  searching.value = true
  results.value = null

  try {
    const res = await request.get('/search', { params: { keyword: kw, page: 1, pagesize: 20 }, silent: true })
    const data = res?.data || {}
    results.value = {
      songs: (data.lists || []).slice(0, 15).map(s => ({
        hash: s.FileHash || s.hash || '',
        name: s.SongName || s.songname || s.name || '',
        singer: s.SingerName || s.singername || s.singer || '',
        cover: s.Cover || s.cover || s.img || '',
        album: s.AlbumName || s.album || '',
        album_id: s.AlbumID || s.album_id || '',
      })),
      artists: (data.artists || []).slice(0, 5).map(a => ({
        id: a.id || a.singerid || '',
        name: a.name || a.singername || '',
        pic: a.pic || a.img || '',
      })),
      albums: (data.albums || []).slice(0, 5).map(a => ({
        id: a.albumid || a.id || '',
        name: a.albumname || a.name || '',
        pic: a.pic || a.img || '',
      })),
    }
  } catch (e) { console.error('[Search]', e.message) }
  finally { searching.value = false }
}

const playSong = (song) => {
  player.playSong(song)
}

onMounted(() => fetchHotList())
</script>

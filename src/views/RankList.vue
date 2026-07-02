<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-2xl font-extrabold">排行榜</h1>
    </div>

    <div v-if="loading" class="px-4 space-y-3">
      <div v-for="i in 8" :key="i" class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
        <div class="w-14 h-14 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
        </div>
      </div>
    </div>

    <div v-else class="px-4 pb-20 space-y-3">
      <div 
        v-for="rank in ranks" :key="rank.id"
        @click="$router.push(`/rank/${rank.id}`)"
        class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl active:bg-gray-100 dark:active:bg-slate-800 tap-active"
      >
        <div class="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
          <img v-if="rank.pic" :src="formatImg(rank.pic)" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold truncate">{{ rank.name }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ rank.songcount || '' }} 首歌曲</p>
        </div>
        <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const ranks = ref([])
const loading = ref(true)

const formatImg = (url) => {
  if (!url) return ''
  return String(url).replace(/\{size\}/g, '400')
}

onMounted(async () => {
  try {
    const res = await request.get('/rank/list', { params: { timestamp: Date.now() }, silent: true })
    const list = res?.data?.rank_list || res?.data?.ranks || res?.data || []
    ranks.value = Array.isArray(list) ? list.map(r => ({
      id: r.rankid || r.id || r.rank_id || '',
      name: r.rankname || r.name || '',
      pic: r.imgurl || r.banner7url || r.pic || '',
      songcount: r.songcount || r.song_num || '',
    })) : []
  } catch (e) { console.error('[RankList]', e.message) }
  finally { loading.value = false }
})
</script>

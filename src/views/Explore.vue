<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-2xl font-extrabold">发现音乐</h1>
      <p class="text-xs text-gray-400 mt-1">探索所有歌单分类</p>
    </div>

    <!-- 分类横滑 -->
    <div class="px-4 py-3">
      <div class="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <button 
          v-for="cat in categories" :key="cat.id"
          @click="activeCategory = cat.id; fetchByCategory()"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors tap-scale flex-shrink-0"
          :class="activeCategory === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'"
        >{{ cat.name }}</button>
      </div>
    </div>

    <!-- 歌单网格 -->
    <div class="px-4 pb-20">
      <div v-if="loading" class="grid grid-cols-3 gap-3">
        <div v-for="i in 9" :key="i" class="space-y-2">
          <div class="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div class="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
        </div>
      </div>

      <div v-else class="grid grid-cols-3 gap-3">
        <div 
          v-for="pl in playlists" :key="pl.global_collection_id || pl.specialid"
          @click="$router.push(`/playlist/${pl.global_collection_id || pl.specialid}`)"
          class="flex flex-col tap-scale"
        >
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm relative">
            <img :src="formatImg(pl.imgurl || pl.flexible_cover || pl.pic)" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute top-1.5 right-1.5 bg-black/30 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              {{ formatPlayCount(pl.play_count) }}
            </div>
          </div>
          <h4 class="text-xs font-medium mt-1.5 line-clamp-2 leading-snug">{{ pl.specialname }}</h4>
        </div>
      </div>

      <div v-if="!loading && playlists.length === 0" class="flex flex-col items-center py-16 text-gray-400">
        <p class="text-sm">暂无歌单数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()
const loading = ref(true)
const playlists = ref([])
const activeCategory = ref(0)

const categories = [
  { id: 0, name: '推荐' },
  { id: 1, name: '华语' },
  { id: 2, name: '欧美' },
  { id: 3, name: '日语' },
  { id: 4, name: '韩语' },
  { id: 5, name: '粤语' },
  { id: 6, name: '电子' },
  { id: 7, name: '摇滚' },
  { id: 8, name: '民谣' },
  { id: 9, name: '轻音乐' },
  { id: 10, name: '影视原声' },
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

const fetchByCategory = async () => {
  loading.value = true
  try {
    const res = await request.get('/top/playlist', { params: { category_id: activeCategory.value }, silent: true })
    if (res?.data?.special_list) playlists.value = res.data.special_list
  } catch (e) { console.error('[Explore]', e.message) }
  finally { loading.value = false }
}

onMounted(() => fetchByCategory())
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>

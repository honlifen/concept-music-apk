<template>
  <div class="h-full flex flex-col bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 overflow-hidden safe-top">
    
    <!-- 顶部状态栏 (仅子页面显示返回按钮) -->
    <header v-if="showBackButton" class="h-12 flex items-center px-4 bg-white/95 dark:bg-slate-900/95 border-b border-gray-100 dark:border-slate-800 shrink-0 z-30">
      <button @click="$router.back()" class="w-8 h-8 flex items-center justify-center -ml-1 text-gray-500 active:text-blue-600 tap-scale">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <span class="ml-2 text-sm font-bold truncate">{{ pageTitle }}</span>
      <div class="flex-1" />
      <slot name="headerActions" />
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-hidden relative" :class="{ 'mb-[calc(56px+52px)]': currentSong, 'mb-14': !currentSong }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <keep-alive include="Discover,Explore,Library">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <!-- Mini 播放条 -->
    <transition name="slide-up">
      <div 
        v-if="currentSong && !player.showFullPlayer" 
        @click="player.toggleFullPlayer()"
        class="fixed bottom-14 left-0 right-0 h-[52px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 flex items-center px-3 gap-3 z-40 cursor-pointer tap-active safe-bottom"
        :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }"
      >
        <!-- 封面 -->
        <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
          <img v-if="currentSong.cover" :src="currentSong.cover" class="w-full h-full object-cover" />
          <svg v-else class="w-full h-full text-gray-300 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        
        <!-- 信息 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold truncate">{{ currentSong.name }}</span>
            <span v-if="currentSong.is_vip" class="text-[8px] px-1 py-px rounded bg-blue-50 text-blue-500 font-bold flex-shrink-0">VIP</span>
          </div>
          <p class="text-xs text-gray-400 truncate">{{ currentSong.singer }}</p>
        </div>

        <!-- 控件 -->
        <button @click.stop="player.togglePlay()" class="w-9 h-9 flex items-center justify-center flex-shrink-0 tap-scale">
          <svg v-if="player.isLoading" class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg v-else-if="player.isPlaying" class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd"/></svg>
          <svg v-else class="w-5 h-5 text-gray-600 ml-[2px]" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd"/></svg>
        </button>

        <!-- 进度条 -->
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-slate-700">
          <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: player.progress + '%' }" />
        </div>
      </div>
    </transition>

    <!-- 底部导航 -->
    <nav class="h-14 bg-white/95 dark:bg-slate-900/95 border-t border-gray-100 dark:border-slate-800 flex items-center shrink-0 z-40 safe-bottom">
      <button 
        v-for="tab in tabs" :key="tab.path"
        @click="navigateTab(tab.path)"
        class="flex-1 h-full flex flex-col items-center justify-center gap-0.5 tap-active transition-colors"
        :class="activeTab === tab.key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'"
      >
        <component :is="tab.icon" class="w-5 h-5" />
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- 全屏播放器 -->
    <transition name="sheet">
      <FullPlayer v-if="player.showFullPlayer" />
    </transition>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="player.toastMessage" class="fixed top-16 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-4 py-2 rounded-full text-xs font-medium z-[200] shadow-lg whitespace-nowrap pointer-events-none">
        {{ player.toastMessage }}
      </div>
    </transition>

    <!-- 登录弹窗 -->
    <transition name="fade-scale">
      <LoginModal v-if="userStore.showLoginModal" @close="userStore.closeLoginModal()" />
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from './store/playerStore'
import { useUserStore } from './store/userStore'
import FullPlayer from './components/FullPlayer.vue'
import LoginModal from './components/LoginModal.vue'
import { h } from 'vue'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const userStore = useUserStore()

const currentSong = computed(() => player.currentSong)

const activeTab = computed(() => route.meta?.tab || '')

// Tab 图标 SVG
const icons = {
  home: {
    render() { return h('svg', { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', viewBox: '0 0 24 24', innerHTML: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' }) }
  },
  explore: {
    render() { return h('svg', { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', viewBox: '0 0 24 24', innerHTML: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>' }) }
  },
  search: {
    render() { return h('svg', { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', viewBox: '0 0 24 24', innerHTML: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>' }) }
  },
  library: {
    render() { return h('svg', { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', viewBox: '0 0 24 24', innerHTML: '<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>' }) }
  }
}

const tabs = [
  { key: 'home', path: '/', label: '首页', icon: icons.home },
  { key: 'explore', path: '/explore', label: '发现', icon: icons.explore },
  { key: 'search', path: '/search', label: '搜索', icon: icons.search },
  { key: 'library', path: '/library', label: '我的', icon: icons.library }
]

const showBackButton = computed(() => {
  return !['home', 'explore', 'search', 'library'].includes(activeTab.value)
})

const pageTitle = computed(() => {
  return route.meta?.title || '概念音乐'
})

function navigateTab(path) {
  router.push(path)
}
</script>

<style scoped>
.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-leave-active { transition: transform 0.2s ease-in; }
.slide-up-enter-from,
.slide-up-leave-to { transform: translateY(100%); }

.sheet-enter-active { transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active { transition: transform 0.25s ease-in; }
.sheet-enter-from,
.sheet-leave-to { transform: translateY(100%); }

.toast-fade-enter-active { transition: opacity 0.2s, transform 0.2s; }
.toast-fade-leave-active { transition: opacity 0.15s; }
.toast-fade-enter-from { opacity: 0; transform: translate(-50%, -8px); }
.toast-fade-leave-to { opacity: 0; }

.fade-scale-enter-active { transition: opacity 0.2s, transform 0.2s; }
.fade-scale-leave-active { transition: opacity 0.15s, transform 0.15s; }
.fade-scale-enter-from { opacity: 0; transform: scale(0.95); }
.fade-scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>

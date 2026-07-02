// ====================
// 概念音乐 APK — User Store
// 精简版，适配移动端
// ====================
import { defineStore } from 'pinia'
import request from '../utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: localStorage.getItem('cm_isLoggedIn') === 'true',
    userInfo: JSON.parse(localStorage.getItem('cm_userInfo') || '{"nickname":"","avatar":"","vip":0}'),
    showLoginModal: false,
    vipStatus: JSON.parse(localStorage.getItem('cm_vip_status') || '{"isVip":false,"level":"normal","displayName":"普通用户"}'),
    vipExpirationTime: localStorage.getItem('cm_vip_expire') || '',
    vipLevelName: localStorage.getItem('cm_vip_name') || '普通用户',

    likedHashes: [],
    likedPlaylistGlobalId: null,
    collectedListIds: [],
    createdListIds: [],
    playlistMap: {},

    localHistory: JSON.parse(localStorage.getItem('cm_local_history') || '[]'),
    localPlayCounts: JSON.parse(localStorage.getItem('cm_local_play_counts') || '{}')
  }),

  actions: {
    openLoginModal() { this.showLoginModal = true },
    closeLoginModal() { this.showLoginModal = false },

    async login(credentials) {
      try {
        const res = await request.get('/login/qr', { params: { ...credentials, timestamp: Date.now() } })
        // 简化处理 — 实际可能需要扫码等流程
        return res
      } catch (e) {
        return { status: -1, error_msg: e.message }
      }
    },

    setLoggedIn(userData) {
      this.isLoggedIn = true
      this.userInfo = userData
      localStorage.setItem('cm_isLoggedIn', 'true')
      localStorage.setItem('cm_userInfo', JSON.stringify(userData))
    },

    logout() {
      this.isLoggedIn = false
      this.userInfo = { nickname: '', avatar: '', vip: 0 }
      localStorage.removeItem('cm_isLoggedIn')
      localStorage.removeItem('cm_userInfo')
      localStorage.removeItem('cm_vip_status')
      localStorage.removeItem('cm_vip_expire')
      localStorage.removeItem('cm_vip_name')
      this.likedHashes = []
    },

    addLocalHistory(songObj) {
      const hash = (songObj._hash || '').toUpperCase()
      if (!hash) return
      this.localHistory = this.localHistory.filter(s => (s._hash || '').toUpperCase() !== hash)
      this.localHistory.unshift(songObj)
      if (this.localHistory.length > 100) this.localHistory.pop()
      localStorage.setItem('cm_local_history', JSON.stringify(this.localHistory))
      this.localPlayCounts[hash] = (this.localPlayCounts[hash] || 0) + 1
      localStorage.setItem('cm_local_play_counts', JSON.stringify(this.localPlayCounts))
    },

    toggleLikeSong(song) {
      const hash = (song.hash || song._hash || '').toUpperCase()
      if (!hash) return
      const idx = this.likedHashes.indexOf(hash)
      if (idx >= 0) {
        this.likedHashes.splice(idx, 1)
      } else {
        this.likedHashes.unshift(hash)
      }
    },

    isLiked(song) {
      const hash = (song.hash || song._hash || '').toUpperCase()
      return hash && this.likedHashes.includes(hash)
    }
  }
})

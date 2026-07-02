// ====================
// 概念音乐 APK — Player Store
// 精简自桌面版，适配移动端触摸交互
// ====================
import { defineStore } from 'pinia'
import request from '../utils/request'
import { useUserStore } from './userStore'

const audio = new Audio()
audio.preload = 'auto'
audio.crossOrigin = 'anonymous'

const urlCache = new Map()

const getCachedUrl = (hash, quality) => {
  const key = `${hash}_${quality}`
  if (urlCache.has(key)) {
    const item = urlCache.get(key)
    if (Date.now() - item.time < 3600000) return item
    urlCache.delete(key)
  }
  return null
}

const setCachedUrl = (hash, quality, data) => {
  const key = `${hash}_${quality}`
  urlCache.set(key, { ...data, time: Date.now() })
  if (urlCache.size > 50) {
    let oldestKey = null, oldestTime = Infinity
    for (const [k, v] of urlCache) {
      if (v.time < oldestTime) { oldestTime = v.time; oldestKey = k }
    }
    if (oldestKey) urlCache.delete(oldestKey)
  }
}

export const QUALITY_CONFIG = [
  { key: 'high', name: '超高无损', param: 'high' },
  { key: 'sq', name: '无损 SQ', param: 'flac' },
  { key: 'hq', name: '高品质 HQ', param: '320' },
  { key: 'standard', name: '标准音质', param: '128' }
]

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: null,
    isPlaying: false,
    isLoading: false,
    isError: false,
    errorMessage: '',
    currentTime: 0,
    duration: 0,
    playlist: [],
    playMode: 'sequence', // sequence | loop | repeat

    volume: (() => { const v = parseFloat(localStorage.getItem('cm_volume')); return (isNaN(v) || v < 0 || v > 1) ? 1 : v; })(),
    savedVolume: 1,
    currentQuality: 'hq',

    showFullPlayer: false,
    toastMessage: '',
    toastTimeout: null,

    isCurrentSongPreview: false,
    hasReportedCurrentSong: false
  }),

  getters: {
    progress() {
      if (!this.duration) return 0
      return (this.currentTime / this.duration) * 100
    },
    currentIndex() {
      if (!this.currentSong) return -1
      return this.playlist.findIndex(s => s.hash === this.currentSong.hash)
    },
    hasNext() {
      return this.currentIndex < this.playlist.length - 1
    },
    hasPrev() {
      return this.currentIndex > 0
    }
  },

  actions: {
    initAudio() {
      audio.addEventListener('timeupdate', () => {
        if (this.isCurrentSongPreview && audio.currentTime >= 60) {
          audio.pause()
          this.currentTime = 60
          this.playNext(true)
          return
        }
        this.currentTime = audio.currentTime
        if (!this.hasReportedCurrentSong && this.currentTime >= 3 && this.currentSong) {
          this.hasReportedCurrentSong = true
          const userStore = useUserStore()
          if (userStore.isLoggedIn) {
            const hash = this.currentSong.hash || ''
            request.get('/playhistory/upload', { params: { hash, timestamp: Date.now() }, silent: true }).catch(() => { })
          }
        }
      })
      audio.addEventListener('loadedmetadata', () => {
        let dur = audio.duration
        if (this.isCurrentSongPreview && dur > 60) {
          this.duration = 60
        } else {
          this.duration = dur
        }
      })
      audio.addEventListener('playing', () => { this.isLoading = false; this.isPlaying = true })
      audio.addEventListener('pause', () => { this.isPlaying = false })
      audio.addEventListener('ended', () => { this.playNext(true) })
      audio.addEventListener('error', () => {
        this.isError = true
        this.errorMessage = '播放失败，正在跳过...'
        setTimeout(() => { this.isError = false; this.playNext(true) }, 2000)
      })
    },

    async resolveUrl(hash, quality = 'hq') {
      const cached = getCachedUrl(hash, quality)
      if (cached) return cached
      try {
        const res = await request.get('/song/url', { params: { hash, quality } })
        if (res?.data?.url) {
          setCachedUrl(hash, quality, res.data)
          return res.data
        }
      } catch (e) {
        console.error('[Player] URL resolve failed:', e.message)
      }
      return null
    },

    async playSong(song) {
      if (!song?.hash && !song?._hash) {
        this.showToast('无法播放：缺少歌曲标识')
        return
      }
      const hash = song.hash || song._hash
      this.isLoading = true
      this.isError = false
      this.hasReportedCurrentSong = false

      // 构建歌曲对象
      const normalized = {
        hash,
        name: song.name || song._title || '未知歌曲',
        singer: song.singer || song._singer || '未知歌手',
        singer_id: song.singer_id || song._singer_id || '',
        cover: song.cover || song._cover || '',
        album: song.album || song._album || '',
        album_id: song.album_id || song._album_id || '',
        is_vip: song.is_vip || song._is_vip || false,
        is_paid: song.is_paid || song._is_paid || false,
        _singers: song._singers || (song.singer ? [{ id: String(song.singer_id || ''), name: song.singer }] : [])
      }

      this.currentSong = normalized

      // 确保在播放列表中
      const exists = this.playlist.find(s => s.hash === hash)
      if (!exists) {
        this.playlist.push(normalized)
      }

      const data = await this.resolveUrl(hash, this.currentQuality)
      if (!data?.url) {
        this.isLoading = false
        this.isError = true
        this.errorMessage = '获取播放地址失败'
        return
      }

      this.isCurrentSongPreview = !!(data.is_preview || data.bitrate < 128000)
      audio.src = data.url
      audio.play().catch(() => {
        this.isLoading = false
        this.isError = true
        this.errorMessage = '自动播放被阻止，请点击播放按钮'
      })
    },

    togglePlay() {
      if (!this.currentSong) return
      if (audio.paused) {
        audio.play().catch(() => { })
      } else {
        audio.pause()
      }
    },

    playNext(auto = false) {
      if (this.playlist.length === 0) return
      const idx = this.currentIndex
      if (idx < 0) {
        this.playSong(this.playlist[0])
        return
      }
      let nextIdx
      if (this.playMode === 'repeat') {
        nextIdx = idx
      } else if (this.playMode === 'loop') {
        nextIdx = (idx + 1) % this.playlist.length
      } else {
        nextIdx = idx + 1
        if (nextIdx >= this.playlist.length) {
          if (auto) { this.isPlaying = false; return }
          nextIdx = 0
        }
      }
      this.currentTime = 0
      this.playSong(this.playlist[nextIdx])
    },

    playPrev() {
      if (this.currentTime > 3) {
        audio.currentTime = 0
        return
      }
      const idx = this.currentIndex
      if (idx <= 0) {
        audio.currentTime = 0
        return
      }
      this.currentTime = 0
      this.playSong(this.playlist[idx - 1])
    },

    seekTo(time) {
      audio.currentTime = Math.max(0, Math.min(time, this.duration || 0))
      this.currentTime = audio.currentTime
    },

    setVolume(v) {
      this.volume = Math.max(0, Math.min(1, v))
      audio.volume = this.volume
      localStorage.setItem('cm_volume', this.volume)
    },

    toggleMute() {
      if (this.volume > 0) {
        this.savedVolume = this.volume
        this.setVolume(0)
      } else {
        this.setVolume(this.savedVolume || 1)
      }
    },

    togglePlayMode() {
      const modes = ['sequence', 'loop', 'repeat']
      const idx = modes.indexOf(this.playMode)
      this.playMode = modes[(idx + 1) % 3]
    },

    switchQuality(key) {
      this.currentQuality = key
      if (this.currentSong) {
        const t = audio.currentTime
        this.playSong(this.currentSong)
        setTimeout(() => { audio.currentTime = t }, 300)
      }
    },

    addToPlaylist(song) {
      const hash = song.hash || song._hash
      if (!hash) return
      if (!this.playlist.find(s => (s.hash || s._hash) === hash)) {
        const normalized = {
          hash,
          name: song.name || song._title || '未知',
          singer: song.singer || song._singer || '未知',
          singer_id: song.singer_id || song._singer_id || '',
          cover: song.cover || song._cover || '',
          album: song.album || song._album || '',
          album_id: song.album_id || song._album_id || '',
          is_vip: song.is_vip || song._is_vip || false,
          is_paid: song.is_paid || song._is_paid || false,
          _singers: song._singers || (song.singer ? [{ id: String(song.singer_id || ''), name: song.singer }] : [])
        }
        this.playlist.push(normalized)
      }
    },

    removeFromPlaylist(index) {
      this.playlist.splice(index, 1)
    },

    clearPlaylist() {
      this.playlist = []
      this.currentSong = null
      this.isPlaying = false
      audio.pause()
      audio.removeAttribute('src')
    },

    prependPlaylistAndPlay(songs) {
      const normalized = songs.map(s => ({
        hash: s.hash || s._hash || '',
        name: s.name || s._title || '未知',
        singer: s.singer || s._singer || '未知',
        singer_id: s.singer_id || s._singer_id || '',
        cover: s.cover || s._cover || '',
        album: s.album || s._album || '',
        album_id: s.album_id || s._album_id || '',
        is_vip: s.is_vip || s._is_vip || false,
        is_paid: s.is_paid || s._is_paid || false,
        _singers: s._singers || (s.singer ? [{ id: String(s.singer_id || ''), name: s.singer }] : [])
      })).filter(s => s.hash)
      if (normalized.length === 0) return
      this.playlist = [...normalized]
      this.playSong(normalized[0])
    },

    showToast(msg) {
      this.toastMessage = msg
      if (this.toastTimeout) clearTimeout(this.toastTimeout)
      this.toastTimeout = setTimeout(() => { this.toastMessage = '' }, 2500)
    },

    toggleFullPlayer() {
      this.showFullPlayer = !this.showFullPlayer
    }
  }
})

// ====================
// 概念音乐 APK — Router
// ====================
import { createRouter, createWebHashHistory } from 'vue-router'
import Discover from '../views/Discover.vue'
import Explore from '../views/Explore.vue'
import Search from '../views/Search.vue'
import Library from '../views/Library.vue'
import PlaylistDetail from '../views/PlaylistDetail.vue'
import RankList from '../views/RankList.vue'
import RankDetail from '../views/RankDetail.vue'
import ArtistDetail from '../views/ArtistDetail.vue'
import AlbumDetail from '../views/AlbumDetail.vue'
import History from '../views/History.vue'
import LikedMusic from '../views/LikedMusic.vue'
import PersonalFM from '../views/PersonalFM.vue'
import NewSongs from '../views/NewSongs.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', name: 'Discover', component: Discover, meta: { title: '首页', tab: 'home' } },
  { path: '/explore', name: 'Explore', component: Explore, meta: { title: '发现', tab: 'explore' } },
  { path: '/search', name: 'Search', component: Search, meta: { title: '搜索', tab: 'search' } },
  { path: '/library', name: 'Library', component: Library, meta: { title: '我的', tab: 'library' } },
  { path: '/playlist/:id', name: 'PlaylistDetail', component: PlaylistDetail, meta: { title: '歌单' } },
  { path: '/rank', name: 'RankList', component: RankList, meta: { title: '排行榜' } },
  { path: '/rank/:id', name: 'RankDetail', component: RankDetail, meta: { title: '榜单详情' } },
  { path: '/artist/:id', name: 'ArtistDetail', component: ArtistDetail, meta: { title: '歌手' } },
  { path: '/album/:id', name: 'AlbumDetail', component: AlbumDetail, meta: { title: '专辑' } },
  { path: '/history', name: 'History', component: History, meta: { title: '听歌足迹' } },
  { path: '/liked', name: 'LikedMusic', component: LikedMusic, meta: { title: '我喜欢' } },
  { path: '/fm', name: 'PersonalFM', component: PersonalFM, meta: { title: '私人FM' } },
  { path: '/new-songs', name: 'NewSongs', component: NewSongs, meta: { title: '新歌速递' } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { title: '设置' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

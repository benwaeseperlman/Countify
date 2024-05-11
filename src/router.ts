import { PagePaths } from '@/utils/pagePaths'

import { createMemoryHistory, createRouter } from 'vue-router'

import gameOn from './pages/countify-game-on.vue'
import gameResults from './pages/countify-game-results.vue'
import play from './pages/countify-play.vue'
import uploadChallenge from './pages/countify-upload-challenge.vue'

const routes = [
  { path: PagePaths.HOME, component: play },
  { path: PagePaths.GAME_ON, component: gameOn },
  { path: PagePaths.GAME_RESULTS, component: gameResults },
  { path: PagePaths.PLAY, component: play },
  { path: PagePaths.UPLOAD_CHALLENGE, component: uploadChallenge },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
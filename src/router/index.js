import { createRouter, createWebHistory } from 'vue-router'
import { pages } from '@/utils/docs.js'
import DocPage from '@/views/DocPage.vue'
import NotFound from '@/views/NotFound.vue'

// One route per Markdown file, generated at build time.
const docRoutes = pages.map((page) => ({
  path: page.path,
  name: page.file,
  component: DocPage,
  meta: { title: page.title }
}))

const home = pages.find((page) => page.path === '/')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...docRoutes,
    ...(home ? [] : [{ path: '/', redirect: pages[0]?.path || '/404' }]),
    { path: '/:pathMatch(.*)*', component: NotFound }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}` : 'Docs'
})

export default router

<script setup>
import { reactive, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { tree } from '@/utils/docs.js'
import SidebarFolder from './SidebarFolder.vue'

const STORAGE_KEY = 'sidebar-open-folders'
const route = useRoute()

function loadOpen() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(stored)) return stored
  } catch (error) {
    /* onbruikbare opslag wordt genegeerd */
  }
  // Eerste bezoek: alle mappen op het bovenste niveau open.
  return tree.filter((node) => node.type === 'folder').map((node) => node.path)
}

/**
 * Kleine reactieve open/dicht-opslag, bewaard in localStorage.
 *
 * De map van de huidige pagina wordt geopend bij navigatie, maar daarna mag je
 * hem gewoon dichtklappen — dat was eerder onmogelijk omdat "bevat de actieve
 * pagina" de open-stand overschreef.
 */
const openFolders = reactive({
  paths: loadOpen(),
  has(path) {
    return this.paths.includes(path)
  },
  toggle(path) {
    const index = this.paths.indexOf(path)
    if (index === -1) this.paths.push(path)
    else this.paths.splice(index, 1)
  },
  open(path) {
    if (!this.paths.includes(path)) this.paths.push(path)
  }
})

/** Bij navigatie: klap de mappen open waarin de nieuwe pagina zit. */
watch(
  () => route.path,
  (path) => {
    const segments = path.split('/').filter(Boolean)
    for (let i = 1; i <= segments.length; i++) {
      openFolders.open('/' + segments.slice(0, i).join('/'))
    }
  },
  { immediate: true }
)

watch(
  () => [...openFolders.paths],
  (paths) => localStorage.setItem(STORAGE_KEY, JSON.stringify(paths))
)
</script>

<template>
  <nav aria-label="Documentatie" class="py-2 pl-2 pr-1">
    <p class="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      Docs
    </p>
    <ul class="space-y-0.5">
      <template v-for="node in tree" :key="node.path">
        <SidebarFolder v-if="node.type === 'folder'" :node="node" :open-folders="openFolders" />
        <li v-else>
          <RouterLink
            :to="node.path"
            class="block truncate rounded px-2 py-2 text-[13px] text-gray-600 hover:bg-gray-100
                   dark:text-gray-400 dark:hover:bg-gray-800 sm:py-1.5"
            active-class="bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
          >
            {{ node.title }}
          </RouterLink>
        </li>
      </template>
    </ul>
  </nav>
</template>

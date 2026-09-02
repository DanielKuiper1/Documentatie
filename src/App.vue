<script setup>
import { onMounted, provide, ref, watch } from 'vue'
import { RouterView, useRoute, RouterLink } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import TableOfContents from '@/components/TableOfContents.vue'

const STORAGE_KEY = 'sidebar-collapsed'

const route = useRoute()
const menuOpen = ref(false)
const sidebarOpen = ref(true)

/**
 * De hoofdkolom is het enige dat verticaal schuift. Zijbalk en inhoudsopgave
 * schuiven zelf, binnen hun eigen hoogte. Andere componenten hebben deze
 * verwijzing nodig om te kunnen scrollen en de leespositie te volgen.
 */
const scroller = ref(null)
provide('scroller', scroller)

onMounted(() => {
  try {
    sidebarOpen.value = localStorage.getItem(STORAGE_KEY) !== 'true'
  } catch (error) {
    /* onbruikbare opslag: zijbalk gewoon open */
  }
})

watch(sidebarOpen, (open) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(!open))
  } catch (error) {
    /* niets aan te doen */
  }
})

// Navigeren sluit de mobiele lade altijd en zet de lezer bovenaan.
watch(
  () => route.path,
  () => {
    menuOpen.value = false
    if (scroller.value) scroller.value.scrollTop = 0
  }
)
</script>

<template>
  <!-- Volledige schermhoogte, niets schuift buiten de kolommen om. -->
  <div class="flex h-[100dvh] flex-col overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <header
      class="flex h-14 shrink-0 items-center gap-1 border-b border-gray-200 px-2 dark:border-gray-800"
    >
      <!-- Mobiel: lade openen. Desktop: zijbalk in- en uitklappen. -->
      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-600
               hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
        :aria-expanded="menuOpen"
        aria-controls="mobiel-menu"
        :aria-label="menuOpen ? 'Menu sluiten' : 'Menu openen'"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="menuOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <button
        type="button"
        class="hidden h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100
               md:inline-flex dark:text-gray-300 dark:hover:bg-gray-800"
        :aria-expanded="sidebarOpen"
        aria-controls="zijbalk"
        :aria-label="sidebarOpen ? 'Zijbalk sluiten' : 'Zijbalk openen'"
        :title="sidebarOpen ? 'Zijbalk sluiten' : 'Zijbalk openen'"
        @click="sidebarOpen = !sidebarOpen"
      >
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </svg>
      </button>

      <RouterLink to="/" class="ml-1 truncate font-semibold">Docs</RouterLink>

      <div class="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Zijbalk: eigen schuifgebied, verdwijnt volledig als hij dicht is. -->
      <aside
        v-show="sidebarOpen"
        id="zijbalk"
        class="doc-pane hidden w-[11rem] shrink-0 overflow-y-auto border-r border-gray-200 md:block
               dark:border-gray-800"
      >
        <Sidebar />
      </aside>

      <!--
        Mobiele lade. Hij begint precies onder de navbalk en de laag eroverheen
        laat de balk vrij, zodat het menu bij de navigatie hoort in plaats van
        er los onder te hangen. Alles is `fixed`, dus de tekst eronder schuift
        niet en er ontstaat geen extra paginabalk.
      -->
      <Transition name="lade">
        <div v-if="menuOpen" id="mobiel-menu" class="fixed inset-x-0 bottom-0 top-14 z-40 md:hidden">
          <div class="absolute inset-0 bg-gray-900/40 dark:bg-black/60" @click="menuOpen = false" />
          <aside
            class="doc-pane absolute bottom-0 left-0 top-0 w-[16rem] max-w-[82vw] overflow-y-auto border-r
                   border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <Sidebar />
          </aside>
        </div>
      </Transition>

      <!-- De enige kolom die de pagina zelf laat schuiven. -->
      <main id="hoofdinhoud" ref="scroller" class="doc-pane min-w-0 flex-1 overflow-y-auto">
        <RouterView />
      </main>

      <!-- Eigen kolom, niet ín de hoofdkolom: anders staan de twee schuifbalken
           vlak naast elkaar. -->
      <TableOfContents variant="column" />
    </div>
  </div>
</template>

<style scoped>
/* Korte, rustige beweging; geen layoutverschuiving want alles staat fixed. */
.lade-enter-active,
.lade-leave-active {
  transition: opacity 0.15s ease;
}

.lade-enter-active aside,
.lade-leave-active aside {
  transition: transform 0.18s ease;
}

.lade-enter-from,
.lade-leave-to {
  opacity: 0;
}

.lade-enter-from aside,
.lade-leave-to aside {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .lade-enter-active,
  .lade-leave-active,
  .lade-enter-active aside,
  .lade-leave-active aside {
    transition: none;
  }
}
</style>

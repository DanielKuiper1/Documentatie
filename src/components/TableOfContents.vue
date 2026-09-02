<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPage } from '@/utils/docs.js'
import { extractHeadings, buildHeadingTree, flattenHeadings } from '@/utils/markdown.js'

/**
 * "Op deze pagina".
 *
 * Staat op groot scherm als eigen kolom náást de hoofdkolom (variant `column`),
 * en op mobiel ingeklapt bovenaan de tekst (variant `inline`). Door de kolom
 * buiten de schuivende hoofdkolom te houden, staan de twee schuifbalken niet
 * vlak naast elkaar.
 */
const props = defineProps({
  variant: { type: String, default: 'column' } // 'column' | 'inline'
})

const STORAGE_KEY = 'toc-collapsed'

const route = useRoute()
const router = useRouter()
const scroller = inject('scroller', ref(null))

const page = computed(() => getPage(route.path))
const outline = computed(() =>
  page.value ? flattenHeadings(buildHeadingTree(extractHeadings(page.value.source))) : []
)
const hasOutline = computed(() => outline.value.length > 1)

const activeSlug = ref('')
const open = ref(props.variant === 'column')

/** Actief kopje = het laatste dat boven de leeslijn staat. */
function updateActive() {
  const top = scroller.value ? scroller.value.getBoundingClientRect().top : 0
  let current = ''
  for (const heading of outline.value) {
    const element = document.getElementById(heading.slug)
    if (element && element.getBoundingClientRect().top - top <= 40) current = heading.slug
  }
  if (!current && outline.value.length) current = outline.value[0].slug
  activeSlug.value = current
}

onMounted(() => {
  if (props.variant === 'column') {
    try {
      open.value = localStorage.getItem(STORAGE_KEY) !== 'true'
    } catch (error) {
      /* onbruikbare opslag: gewoon open */
    }
  }
  updateActive()
  scroller.value?.addEventListener('scroll', updateActive, { passive: true })
  window.addEventListener('resize', updateActive, { passive: true })
})

onBeforeUnmount(() => {
  scroller.value?.removeEventListener('scroll', updateActive)
  window.removeEventListener('resize', updateActive)
})

watch(open, (value) => {
  if (props.variant !== 'column') return
  try {
    localStorage.setItem(STORAGE_KEY, String(!value))
  } catch (error) {
    /* niets aan te doen */
  }
})

watch(
  () => route.path,
  async () => {
    if (props.variant === 'inline') open.value = false
    await nextTick()
    updateActive()
  }
)

function goTo(slug) {
  if (props.variant === 'inline') open.value = false
  const element = document.getElementById(slug)
  const container = scroller.value
  if (element && container) {
    const offset = element.getBoundingClientRect().top - container.getBoundingClientRect().top
    container.scrollTo({ top: container.scrollTop + offset - 12 })
  }
  router.replace({ hash: `#${slug}` })
  activeSlug.value = slug
}
</script>

<template>
  <!-- Mobiel en tablet: ingeklapt kaartje boven de tekst. -->
  <div
    v-if="variant === 'inline' && hasOutline"
    class="mb-6 rounded-md border border-gray-200 xl:hidden dark:border-gray-800"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold
             text-gray-700 dark:text-gray-200"
      :aria-expanded="open"
      @click="open = !open"
    >
      Op deze pagina
      <svg
        class="h-4 w-4 shrink-0 text-gray-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <ul v-show="open" class="border-t border-gray-200 px-3 py-2 dark:border-gray-800">
      <li v-for="heading in outline" :key="heading.slug">
        <a
          :href="`#${heading.slug}`"
          class="block py-1.5 text-sm"
          :class="
            activeSlug === heading.slug
              ? 'font-medium text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400'
          "
          :style="{ paddingLeft: heading.depth * 14 + 'px' }"
          @click.prevent="goTo(heading.slug)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </div>

  <!--
    Groot scherm: eigen kolom naast de hoofdkolom. Schuift alleen zelf als de
    lijst langer is dan het scherm.
  -->
  <aside
    v-else-if="variant === 'column' && hasOutline"
    class="doc-pane hidden shrink-0 overflow-y-auto py-8 pl-1 pr-5 xl:block"
    :class="open ? 'w-56' : 'w-12'"
  >
    <button
      type="button"
      class="mb-2 flex w-full items-center justify-between gap-2 rounded py-1 text-[11px] font-semibold
             uppercase tracking-wide text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
      :aria-expanded="open"
      :title="open ? 'Inhoudsopgave sluiten' : 'Inhoudsopgave openen'"
      @click="open = !open"
    >
      <span v-if="open">Op deze pagina</span>
      <svg
        class="h-4 w-4 shrink-0 transition-transform"
        :class="open ? '' : 'rotate-180'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>

    <!-- De dunne lijn links loopt door achter alle niveaus. -->
    <ul v-show="open" class="space-y-1 border-l border-gray-200 dark:border-gray-800">
      <li v-for="heading in outline" :key="heading.slug">
        <a
          :href="`#${heading.slug}`"
          class="-ml-px block border-l py-0.5 pr-2 text-sm transition-colors"
          :class="
            activeSlug === heading.slug
              ? 'border-blue-600 font-medium text-blue-700 dark:border-blue-400 dark:text-blue-300'
              : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-100'
          "
          :style="{ paddingLeft: heading.depth * 12 + 12 + 'px' }"
          @click.prevent="goTo(heading.slug)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </aside>
</template>

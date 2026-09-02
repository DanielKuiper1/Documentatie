<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPage } from '@/utils/docs.js'
import MarkdownContent from '@/components/MarkdownContent.vue'
import TableOfContents from '@/components/TableOfContents.vue'
import NotFound from './NotFound.vue'

const route = useRoute()
const page = computed(() => getPage(route.path))
</script>

<template>
  <!-- Geen maximumbreedte: als een zijkolom dichtklapt, moet de tekst de
       vrijgekomen ruimte ook echt gebruiken. -->
  <div v-if="page" class="min-w-0 px-4 py-6 sm:px-6 sm:py-8">
    <!-- Op groot scherm staat de inhoudsopgave als eigen kolom in App.vue. -->
    <TableOfContents variant="inline" />

    <MarkdownContent :source="page.source" :path="page.path" />

    <footer class="mt-12 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
      Bron: <code>docs/{{ page.file }}</code>
    </footer>
  </div>
  <NotFound v-else />
</template>

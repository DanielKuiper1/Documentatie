<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { renderDocument } from '@/utils/markdown.js'
import CodeBlock from './CodeBlock.vue'
import InteractiveExample from './InteractiveExample.vue'
import InteractiveTable from './InteractiveTable.vue'
import PlotChart from './PlotChart.vue'
import CodeGroup from './CodeGroup.vue'
import PythonRunner from './PythonRunner.vue'

const props = defineProps({
  source: { type: String, required: true },
  path: { type: String, default: '/' }
})

const blocks = computed(() => renderDocument(props.source, props.path))

const router = useRouter()

/**
 * Markdown links are plain `<a>` elements inside `v-html`, so router
 * navigation is handled here instead of with `<RouterLink>`.
 */
function onClick(event) {
  const anchor = event.target.closest('a[data-internal]')
  if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
  const href = anchor.getAttribute('href')
  if (!href) return
  if (href.startsWith('#')) return // let the browser jump to the anchor
  event.preventDefault()
  router.push(href)
}
</script>

<template>
  <article class="prose prose-gray min-w-0 max-w-none dark:prose-invert" @click="onClick">
    <template v-for="(block, index) in blocks" :key="index">
      <div v-if="block.type === 'html'" v-html="block.html" />
      <CodeBlock v-else-if="block.type === 'code'" :code="block.code" :language="block.language" />
      <InteractiveExample v-else-if="block.type === 'interactive'" :source="block.source" />
      <InteractiveTable v-else-if="block.type === 'interactive-table'" :source="block.source" />
      <PlotChart v-else-if="block.type === 'plot'" :source="block.source" />
      <CodeGroup v-else-if="block.type === 'code-group'" :source="block.source" />
      <PythonRunner v-else-if="block.type === 'python'" :source="block.source" />
    </template>
  </article>
</template>

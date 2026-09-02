<script setup>
import { computed, ref } from 'vue'
import { highlight } from '@/utils/markdown.js'

const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: '' },
  label: { type: String, default: '' },
  flush: { type: Boolean, default: false }, // zit in een ander kader (codegroep)
  lineNumbers: { type: Boolean, default: true }
})

const lines = computed(() => props.code.replace(/\n$/, '').split('\n'))
const html = computed(() => highlight(props.code.replace(/\n$/, ''), props.language))
// Nummers boven de 99 hebben meer ruimte nodig; dat scheelt een sprong.
const gutterWidth = computed(() => `${String(lines.value.length).length + 1}ch`)
// In een codegroep zit de code al in een kader met tabbladen; daar mag de
// ruimte boven en onder de code krapper dan bij een los codeblok.
const padY = computed(() => (props.flush ? 'py-2' : 'py-3'))

const copied = ref(false)

async function copy() {
  // Kopieert de bron, niet de DOM: regelnummers gaan dus nooit mee.
  try {
    await navigator.clipboard.writeText(props.code.replace(/\n$/, ''))
  } catch (error) {
    return
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <!--
    In een codegroep is dit geen zelfstandig blok: dan geen `doc-block`, want die
    klasse brengt de buitenmarge van een los blok mee (en die is hier dubbel).
  -->
  <div
    class="not-prose"
    :class="flush ? '' : 'doc-block overflow-hidden rounded-md border border-gray-200 dark:border-gray-700'"
  >
    <div
      v-if="!flush"
      class="flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5
             text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400"
    >
      <span class="truncate font-mono">{{ label || language || 'tekst' }}</span>
      <button type="button" class="doc-button shrink-0" @click="copy">
        {{ copied ? 'Gekopieerd' : 'Kopiëren' }}
      </button>
    </div>

    <div class="doc-scroll-x code-scroll bg-white dark:bg-gray-900">
      <div class="flex min-w-max">
        <!--
          De goot blijft links staan tijdens horizontaal schuiven en is
          aria-hidden + niet selecteerbaar, zodat nummers nooit meekopiëren.
        -->
        <pre
          v-if="lineNumbers"
          aria-hidden="true"
          class="code-gutter sticky left-0 z-10 m-0 select-none border-r border-gray-200 bg-gray-50
                 pl-3 pr-2 text-right text-[13px] leading-relaxed text-gray-400
                 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-500"
          :class="padY"
          :style="{ minWidth: gutterWidth }"
        >{{ lines.map((_, index) => index + 1).join('\n') }}</pre>
        <pre
          class="hljs m-0 min-w-0 bg-transparent px-4 text-[13px] leading-relaxed"
          :class="padY"
        ><code v-html="html" /></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Goot en code delen exact dezelfde regelhoogte, anders lopen ze uiteen. */
.code-gutter,
.hljs {
  line-height: 1.625;
  font-variant-ligatures: none;
  tab-size: 2;
}
</style>

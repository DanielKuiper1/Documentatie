<script setup>
import { computed, ref } from 'vue'
import CodeBlock from './CodeBlock.vue'

/**
 * ```code-group
 * === npm | bash
 * npm install
 * === pnpm | bash
 * pnpm install
 * ```
 *
 * Elke `===`-regel begint een nieuw tabblad: label links, taal achter de `|`.
 */
const props = defineProps({ source: { type: String, required: true } })

const tabs = computed(() => {
  const result = []
  let current = null

  for (const line of props.source.split('\n')) {
    const header = line.match(/^===\s*(.+)$/)
    if (header) {
      const [label, language = ''] = header[1].split('|').map((part) => part.trim())
      current = { label, language, lines: [] }
      result.push(current)
      continue
    }
    if (current) current.lines.push(line)
  }

  return result.map((tab) => ({ ...tab, code: tab.lines.join('\n').replace(/^\n+|\n+$/g, '') }))
})

const active = ref(0)
const copied = ref(false)

async function copyActive() {
  try {
    await navigator.clipboard.writeText(tabs.value[active.value]?.code ?? '')
  } catch (error) {
    return
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function onKeydown(event) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const step = event.key === 'ArrowRight' ? 1 : -1
  active.value = (active.value + step + tabs.value.length) % tabs.value.length
}
</script>

<template>
  <div class="doc-block not-prose overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
    <p v-if="!tabs.length" class="px-4 py-3 text-sm text-red-600 dark:text-red-400">
      Een codegroep heeft minstens één <code>===</code>-regel nodig.
    </p>

    <template v-else>
      <div
        class="flex items-stretch gap-2 border-b border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-800/60"
      >
        <div class="doc-scroll-x flex min-w-0 flex-1 gap-1" role="tablist" @keydown="onKeydown">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.label"
            type="button"
            role="tab"
            :aria-selected="active === index"
            :tabindex="active === index ? 0 : -1"
            class="-mb-px shrink-0 border-b-2 px-2 py-1.5 text-xs font-medium transition-colors"
            :class="
              active === index
                ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
            "
            @click="active = index"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Kopieert het zichtbare tabblad; staat naast de tabs, niet erover. -->
        <button type="button" class="doc-button my-1.5 shrink-0" @click="copyActive">
          {{ copied ? 'Gekopieerd' : 'Kopiëren' }}
        </button>
      </div>

      <CodeBlock
        v-for="(tab, index) in tabs"
        v-show="active === index"
        :key="tab.label"
        :code="tab.code"
        :language="tab.language"
        flush
      />
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import { runPython, outputToPlotSource, requiredPackages, DEFAULT_TIMEOUT } from '@/utils/python.js'
import { highlight } from '@/utils/markdown.js'
import PlotChart from './PlotChart.vue'

/**
 * ```python-run
 * import pandas as pd
 * df = pd.DataFrame({"jaar": [2021, 2022], "omzet": [10, 14]})
 * table(df)
 * ```
 *
 * De code is aanpasbaar en draait in een Web Worker, met tijdslimiet.
 */
const props = defineProps({
  source: { type: String, required: true },
  info: { type: String, default: '' }
})

const uid = Math.random().toString(36).slice(2, 8)

const code = ref('')
const status = ref('')
const busy = ref(false)
const result = ref(null)

const area = ref(null)
const gutter = ref(null)
const overlay = ref(null)

watchEffect(() => {
  code.value = props.source.replace(/\n+$/, '')
  result.value = null
  status.value = ''
})

const packages = computed(() => requiredPackages(code.value))
/** Alleen aangepaste code valt te herstellen. */
const isChanged = computed(() => code.value !== props.source.replace(/\n+$/, ''))
const lines = computed(() => code.value.split('\n'))
const highlighted = computed(() => highlight(code.value + '\n', 'python'))
// Alleen zo breed als de nummers zijn: de goot mag de editor niet groot houden.
const gutterWidth = computed(() => `${String(lines.value.length).length}ch`)

/** Beginhoogte volgt de code, maar de lezer mag hem kleiner slepen. */
const rows = computed(() => Math.min(Math.max(lines.value.length, 2), 24))

/** Markering en nummers schuiven exact mee met het tekstvak. */
function sync() {
  const element = area.value
  if (!element) return
  if (overlay.value) {
    overlay.value.scrollTop = element.scrollTop
    overlay.value.scrollLeft = element.scrollLeft
  }
  if (gutter.value) gutter.value.scrollTop = element.scrollTop
}

watch(code, () => nextTick(sync))

async function run() {
  busy.value = true
  result.value = null
  status.value = 'Starten…'
  result.value = await runPython(code.value, (message) => (status.value = message))
  status.value = result.value.error ? (result.value.timedOut ? 'Gestopt' : 'Mislukt') : 'Klaar'
  busy.value = false
}

/** Ontbrekende waarden (NaN, None, NaT) komen als null binnen. */
function cellText(value) {
  return value === null || value === undefined ? '—' : value
}

function reset() {
  code.value = props.source.replace(/\n+$/, '')
  result.value = null
  status.value = ''
}

const timeoutSeconds = Math.round(DEFAULT_TIMEOUT / 1000)
</script>

<template>
  <div class="doc-block not-prose overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-1.5
             text-xs dark:border-gray-700"
    >
      <span class="font-mono text-gray-500 dark:text-gray-400">
        python{{ packages.length ? ` · ${packages.join(', ')}` : '' }}
      </span>
      <div class="flex items-center gap-2">
        <span v-if="status" class="text-gray-500 dark:text-gray-400">{{ status }}</span>
        <button v-if="isChanged" type="button" class="doc-button" :disabled="busy" @click="reset">
          Herstellen
        </button>
        <button
          type="button"
          class="doc-button doc-button-primary"
          :disabled="busy"
          :title="`Stopt automatisch na ${timeoutSeconds} seconden`"
          @click="run"
        >
          {{ busy ? 'Bezig…' : 'Uitvoeren' }}
        </button>
      </div>
    </div>

    <label class="sr-only" :for="`py-${uid}`">Python-code</label>
    <!--
      Drie lagen die exact dezelfde tekstmaten delen: de nummers links, de
      gekleurde weergave eronder en een doorzichtig tekstvak erbovenop. De goot
      knipt zijn eigen inhoud af, dus het tekstvak bepaalt de hoogte en de
      editor kan zo klein worden als de lezer wil.
    -->
    <div
      class="code-editor bg-white dark:bg-gray-900"
      :style="{ '--gutter-width': `calc(${gutterWidth} + 1.25rem)` }"
    >
      <!-- De goot ligt absoluut in de linkerkolom: zijn eigen hoogte telt niet
           mee, dus het tekstvak kan vrij kleiner gesleept worden. -->
      <div
        ref="gutter"
        class="code-gutter-wrap border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40"
      >
        <pre aria-hidden="true" class="code-gutter text-gray-400 dark:text-gray-500">{{
          lines.map((_, index) => index + 1).join('\n')
        }}</pre>
      </div>

      <div class="code-stack">
        <pre ref="overlay" aria-hidden="true" class="hljs code-layer"><code v-html="highlighted" /></pre>
        <textarea
          :id="`py-${uid}`"
          ref="area"
          v-model="code"
          :rows="rows"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          wrap="off"
          class="code-layer code-input"
          @scroll="sync"
          @input="sync"
        />
      </div>
    </div>

    <!-- Resultaat sluit direct aan op de editor; de grafiek brengt zijn eigen
         kader mee en heeft hier geen extra buitenmarge nodig. -->
    <div v-if="result" class="[&_.doc-block]:my-0">
      <p
        v-if="result.error"
        class="whitespace-pre-wrap border-t border-gray-200 px-4 py-3 font-mono text-xs dark:border-gray-700"
        :class="result.timedOut ? 'text-amber-700 dark:text-amber-400' : 'text-red-600 dark:text-red-400'"
      >
        {{ result.error }}
      </p>

      <pre
        v-if="result.output"
        class="doc-scroll-x m-0 whitespace-pre border-t border-gray-200 px-4 py-3 font-mono text-[13px]
               text-gray-700 dark:border-gray-700 dark:text-gray-300"
      >{{ result.output }}</pre>

      <template v-for="(output, index) in result.outputs" :key="index">
        <div v-if="output.kind === 'plot'" class="border-t border-gray-200 dark:border-gray-700">
          <PlotChart :source="outputToPlotSource(output)" flush />
        </div>

        <div v-else-if="output.kind === 'table'" class="border-t border-gray-200 dark:border-gray-700">
          <p v-if="output.title" class="px-4 pb-1 pt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ output.title }}
          </p>
          <div class="doc-scroll-x">
            <table class="w-full min-w-max text-sm">
              <thead v-if="output.rows.length > 1">
                <tr class="bg-gray-50 dark:bg-gray-800/60">
                  <th
                    v-for="column in output.columns"
                    :key="column"
                    scope="col"
                    class="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {{ column }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in output.rows"
                  :key="rowIndex"
                  class="border-t border-gray-100 dark:border-gray-800"
                >
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="cellIndex"
                    class="whitespace-nowrap px-3 py-1.5 font-mono text-gray-700 dark:text-gray-300"
                  >
                    <span v-if="output.rows.length === 1" class="mr-2 font-sans text-gray-500 dark:text-gray-400">
                      {{ output.columns[cellIndex] }}:
                    </span>
                    {{ cellText(cell) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Eén set tekstmaten voor alle drie de lagen; wijk hier niet per laag van af,
   anders lopen nummers, kleuren en cursor uiteen. */
.code-editor {
  --code-font: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  --code-size: 13px;
  --code-leading: 1.625;
  --code-pad-y: 0.75rem;
  --code-pad-x: 1rem;

  position: relative;
  min-height: 0;
}

/* Vaste linkerkolom, losgekoppeld van de hoogte van de inhoud. */
.code-gutter-wrap {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--gutter-width);
  overflow: hidden;
}

.code-gutter,
.code-layer {
  margin: 0;
  font-family: var(--code-font);
  font-size: var(--code-size);
  line-height: var(--code-leading);
  font-variant-ligatures: none;
  tab-size: 2;
  white-space: pre;
}

.code-gutter {
  padding: var(--code-pad-y) 0.5rem;
  text-align: right;
  user-select: none;
}

/* De code begint rechts van de goot. */
.code-stack {
  position: relative;
  min-width: 0;
  min-height: 0;
  margin-left: var(--gutter-width);
}

.code-layer {
  padding: var(--code-pad-y) var(--code-pad-x);
  border: 0;
  background: transparent;
}

/* De gekleurde weergave ligt eronder en vangt geen muis. */
.code-stack > .hljs.code-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Het tekstvak ligt erbovenop: onzichtbare letters, zichtbare cursor. */
.code-input {
  position: relative;
  display: block;
  width: 100%;
  min-height: 0;
  resize: vertical;
  overflow: auto;
  color: transparent;
  caret-color: #111827;
  background: transparent;
}

:global(.dark) .code-input {
  caret-color: #e5e7eb;
}

.code-input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.code-input::selection {
  background: rgba(59, 130, 246, 0.35);
}
</style>

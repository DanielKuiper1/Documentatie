<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { parsePlot, formatNumber } from '@/utils/interactive.js'
import { compile } from '@/utils/expression.js'
import { linearRegression, sumSquaredError, ticks, formatTick } from '@/utils/stats.js'
import NumberField from './NumberField.vue'

const props = defineProps({
  source: { type: String, required: true },
  // In een ander kader (bijv. een Python-blok) vervalt de eigen rand en marge.
  flush: { type: Boolean, default: false }
})

const spec = computed(() => parsePlot(props.source))

/* ---------------------------------------------------------------- state --- */

const values = reactive({})
const points = ref([])
const showTable = ref(false)

watchEffect(() => {
  for (const key of Object.keys(values)) delete values[key]
  for (const field of spec.value.fields) values[field.name] = field.value
  points.value = spec.value.points.map((point) => ({ ...point }))
})

function reset() {
  for (const field of spec.value.fields) values[field.name] = field.value
  points.value = spec.value.points.map((point) => ({ ...point }))
}

/* ------------------------------------------------------------------ fit --- */

const fit = computed(() => (spec.value.fit ? linearRegression(points.value) : null))

const fitScope = computed(() => ({
  fit_slope: fit.value?.slope ?? NaN,
  fit_intercept: fit.value?.intercept ?? NaN,
  fit_r2: fit.value?.r2 ?? NaN,
  fit_r: fit.value?.r ?? NaN,
  fit_sse: fit.value?.sse ?? NaN,
  fit_n: fit.value?.n ?? points.value.length,
  fit_meanx: fit.value?.meanX ?? NaN,
  fit_meany: fit.value?.meanY ?? NaN
}))

/** Schuifregelaars plus de fit-resultaten: wat elke expressie hier ziet. */
const scope = computed(() => ({ ...values, ...fitScope.value }))

/* --------------------------------------------------------------- series --- */

// Slot 1 draagt de data en de lijn die eruit volgt; eigen curves nemen de
// volgende slots. Maximaal drie, zodat het palet kleurenblind-veilig blijft.
const CURVE_SLOTS = [2, 3]

/** Compileert de curves één keer; een ongeldige expressie wordt overgeslagen. */
const curves = computed(() =>
  spec.value.curves.slice(0, CURVE_SLOTS.length).flatMap((curve, index) => {
    try {
      const compiled = compile(curve.expression)
      return [{ ...curve, slot: CURVE_SLOTS[index], key: `curve-${index}`, compiled }]
    } catch (error) {
      return []
    }
  })
)

const series = computed(() => {
  const result = []
  if (fit.value) {
    result.push({
      key: 'fit',
      slot: 1,
      label: spec.value.fitLabel,
      predict: (x) => fit.value.slope * x + fit.value.intercept,
      residuals: false
    })
  }
  for (const curve of curves.value) {
    result.push({
      key: curve.key,
      slot: curve.slot,
      label: curve.label,
      predict: (x) => curve.compiled({ ...scope.value, x }),
      residuals: curve.residuals
    })
  }
  return result
})

/* --------------------------------------------------------------- schalen --- */

const WIDTH = 680
const HEIGHT = 380
const MARGIN = { top: 16, right: 16, bottom: 44, left: 56 }
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const SAMPLES = 160

const xDomain = computed(() => {
  const { min, max } = spec.value.x
  if (min !== null && max !== null && min < max) return [min, max]
  const xs = points.value.map((point) => point.x)
  if (!xs.length) return [0, 10]
  const low = Math.min(...xs)
  const high = Math.max(...xs)
  const pad = (high - low || 1) * 0.08
  return [low - pad, high + pad]
})

/**
 * Instellingen waarvoor de y-as ruimte moet bieden: de startwaarden, plus elke
 * schuifregelaar apart op zijn minimum en maximum.
 *
 * Hierdoor hangt de y-as niet af van de huidige standen, en verspringt de
 * grafiek dus niet terwijl je schuift — precies wat je wilt zien: de lijn
 * beweegt, de assen staan stil.
 */
const domainSettings = computed(() => {
  const base = Object.fromEntries(spec.value.fields.map((field) => [field.name, field.value]))
  const settings = [base]
  for (const field of spec.value.fields) {
    settings.push({ ...base, [field.name]: field.min })
    settings.push({ ...base, [field.name]: field.max })
  }
  return settings
})

const yDomain = computed(() => {
  const { min, max } = spec.value.y
  if (min !== null && max !== null && min < max) return [min, max]

  const candidates = points.value.map((point) => point.y)
  const [x0, x1] = xDomain.value

  if (fit.value) {
    candidates.push(fit.value.slope * x0 + fit.value.intercept, fit.value.slope * x1 + fit.value.intercept)
  }
  for (const curve of curves.value) {
    for (const setting of domainSettings.value) {
      for (let i = 0; i <= 12; i++) {
        const x = x0 + ((x1 - x0) * i) / 12
        const value = curve.compiled({ ...setting, ...fitScope.value, x })
        if (Number.isFinite(value)) candidates.push(value)
      }
    }
  }
  if (!candidates.length) return [0, 10]

  let low = Math.min(...candidates)
  let high = Math.max(...candidates)

  // Voorkom dat een uitschieter de eigenlijke data platdrukt.
  if (points.value.length > 1) {
    const ys = points.value.map((point) => point.y)
    const span = Math.max(...ys) - Math.min(...ys) || 1
    low = Math.max(low, Math.min(...ys) - span * 3)
    high = Math.min(high, Math.max(...ys) + span * 3)
  }
  const pad = (high - low || 1) * 0.1
  return [low - pad, high + pad]
})

const toX = (value) =>
  MARGIN.left + ((value - xDomain.value[0]) / (xDomain.value[1] - xDomain.value[0])) * PLOT_WIDTH
const toY = (value) =>
  MARGIN.top + PLOT_HEIGHT - ((value - yDomain.value[0]) / (yDomain.value[1] - yDomain.value[0])) * PLOT_HEIGHT
const fromX = (px) => xDomain.value[0] + ((px - MARGIN.left) / PLOT_WIDTH) * (xDomain.value[1] - xDomain.value[0])
const fromY = (py) =>
  yDomain.value[0] + ((MARGIN.top + PLOT_HEIGHT - py) / PLOT_HEIGHT) * (yDomain.value[1] - yDomain.value[0])

const xTicks = computed(() => ticks(xDomain.value[0], xDomain.value[1], 7))
const yTicks = computed(() => ticks(yDomain.value[0], yDomain.value[1], 5))

/** Eén pad per reeks; waar de curve niet bestaat valt een gat. */
const paths = computed(() =>
  series.value.map((item) => {
    const [x0, x1] = xDomain.value
    let path = ''
    let open = false
    for (let i = 0; i <= SAMPLES; i++) {
      const x = x0 + ((x1 - x0) * i) / SAMPLES
      const y = item.predict(x)
      if (!Number.isFinite(y)) {
        open = false
        continue
      }
      const py = toY(y)
      if (py < MARGIN.top - PLOT_HEIGHT || py > MARGIN.top + PLOT_HEIGHT * 2) {
        open = false
        continue
      }
      path += `${open ? 'L' : 'M'}${toX(x).toFixed(2)} ${py.toFixed(2)}`
      open = true
    }
    return { ...item, d: path }
  })
)

const residualLines = computed(() =>
  paths.value
    .filter((item) => item.residuals)
    .flatMap((item) =>
      points.value.map((point, index) => ({
        key: `${item.key}-${index}`,
        slot: item.slot,
        x: toX(point.x),
        y1: toY(point.y),
        y2: toY(item.predict(point.x))
      }))
    )
    .filter((line) => Number.isFinite(line.y2))
)

/* ------------------------------------------------------------- aflezing --- */

/** Alleen echte meetpunten zijn de moeite waard als tabel. */
const hasData = computed(() => points.value.length > 0)

/**
 * "Herstellen" heeft alleen zin als de lezer iets kán veranderen: een
 * schuifregelaar, of punten die versleept mogen worden. Een vaste
 * functiegrafiek krijgt de knop dus niet.
 */
const canReset = computed(() => spec.value.fields.length > 0 || spec.value.editable)

const readouts = computed(() =>
  spec.value.readouts.map((readout) => {
    let value = NaN
    try {
      value = compile(readout.expression)(scope.value)
    } catch (error) {
      /* wordt als kastlijntje getoond */
    }
    return {
      ...readout,
      display: readout.prefix + formatNumber(value, readout.decimals) + readout.suffix
    }
  })
)

const errors = computed(() => {
  if (!points.value.length || series.value.length < 2) return []
  return series.value.map((item) => ({
    key: item.key,
    label: item.label,
    slot: item.slot,
    sse: sumSquaredError(points.value, item.predict)
  }))
})

/* ------------------------------------------------------------ interactie --- */

const plot = ref(null)
const hover = ref(null)
const dragIndex = ref(-1)
// Een sleep eindigt met een click-event op de SVG; zonder deze vlag zou dat
// meteen een nieuw punt toevoegen op de plek waar je losliet.
let suppressClick = false

/** Muispositie in SVG-eenheden, ook als de SVG geschaald of gecentreerd is. */
function toLocal(event) {
  const svg = plot.value
  const matrix = svg.getScreenCTM()
  if (!matrix) return { x: 0, y: 0 }
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const local = point.matrixTransform(matrix.inverse())
  return { x: local.x, y: local.y }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function onPointerMove(event) {
  const local = toLocal(event)

  if (dragIndex.value !== -1) {
    const point = points.value[dragIndex.value]
    if (!point) return
    point.x = Number(fromX(clamp(local.x, MARGIN.left, MARGIN.left + PLOT_WIDTH)).toFixed(3))
    point.y = Number(fromY(clamp(local.y, MARGIN.top, MARGIN.top + PLOT_HEIGHT)).toFixed(3))
    return
  }

  if (local.x < MARGIN.left || local.x > MARGIN.left + PLOT_WIDTH) {
    hover.value = null
    return
  }

  const nearest = points.value
    .map((point, index) => ({
      index,
      point,
      distance: Math.hypot(toX(point.x) - local.x, toY(point.y) - local.y)
    }))
    .sort((a, b) => a.distance - b.distance)[0]

  if (nearest && nearest.distance < 22) {
    hover.value = { kind: 'point', x: toX(nearest.point.x), y: toY(nearest.point.y), point: nearest.point }
    return
  }

  const dataX = fromX(local.x)
  hover.value = {
    kind: 'curve',
    x: local.x,
    dataX,
    rows: series.value
      .map((item) => ({ key: item.key, label: item.label, slot: item.slot, value: item.predict(dataX) }))
      .filter((row) => Number.isFinite(row.value))
  }
}

function startDrag(index, event) {
  if (!spec.value.editable) return
  dragIndex.value = index
  suppressClick = true
  event.target.setPointerCapture?.(event.pointerId)
  event.preventDefault()
  event.stopPropagation()
}

function endDrag(event) {
  if (dragIndex.value === -1) return
  event.target.releasePointerCapture?.(event.pointerId)
  dragIndex.value = -1
  event.stopPropagation()
}

function onSurfaceClick(event) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  if (!spec.value.editable) return
  const local = toLocal(event)
  if (local.x < MARGIN.left || local.x > MARGIN.left + PLOT_WIDTH) return
  if (local.y < MARGIN.top || local.y > MARGIN.top + PLOT_HEIGHT) return
  points.value.push({ x: Number(fromX(local.x).toFixed(3)), y: Number(fromY(local.y).toFixed(3)) })
}

function removePoint(index) {
  if (!spec.value.editable) return
  suppressClick = true
  points.value.splice(index, 1)
}

/** Houdt een tooltip binnen het tekenvlak, aan welke kant hij ook staat. */
function tooltipX(x, width) {
  const preferred = x + 12 + width > WIDTH - MARGIN.right ? x - 12 - width : x + 12
  return clamp(preferred, 4, WIDTH - width - 4)
}
</script>

<template>
  <figure
    class="viz-root not-prose"
    :class="flush ? '' : 'doc-block rounded-md border border-gray-200 dark:border-gray-700'"
  >
    <figcaption
      class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700"
    >
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ spec.title || 'Grafiek' }}</span>
      <div class="flex items-center gap-2">
        <button v-if="hasData" type="button" class="doc-button" @click="showTable = !showTable">
          {{ showTable ? 'Gegevens verbergen' : 'Gegevens tonen' }}
        </button>
        <button v-if="canReset" type="button" class="doc-button" @click="reset">Herstellen</button>
      </div>
    </figcaption>

    <p v-if="spec.error" class="px-4 py-3 text-sm text-red-600 dark:text-red-400">{{ spec.error }}</p>

    <template v-else>
      <p v-if="spec.description" class="px-4 pt-3 text-sm text-gray-600 dark:text-gray-400">
        {{ spec.description }}
      </p>

      <!-- Legenda: identiteit hangt nooit alleen aan kleur. -->
      <ul v-if="series.length || points.length" class="flex flex-wrap gap-x-4 gap-y-1 px-4 pt-3 text-xs">
        <li v-if="points.length" class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span class="inline-block h-2 w-2 rounded-full" style="background: var(--series-1)" />
          Meetpunten ({{ points.length }})
        </li>
        <li v-for="item in series" :key="item.key" class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span class="inline-block h-0.5 w-4 rounded" :style="{ background: 'var(--series-' + item.slot + ')' }" />
          {{ item.label }}
        </li>
      </ul>

      <!--
        Vaste hoogte, breedte volgt de container: de grafiek schaalt mee maar
        veroorzaakt nooit een layout-sprong en nooit horizontale paginascroll.
      -->
      <div class="viz-frame px-2 pb-2">
        <svg
          ref="plot"
          :viewBox="'0 0 ' + WIDTH + ' ' + HEIGHT"
          preserveAspectRatio="xMidYMid meet"
          class="h-full w-full touch-none select-none"
          role="img"
          :aria-label="(spec.title || 'Grafiek') + ': ' + spec.y.label + ' tegen ' + spec.x.label"
          @pointermove="onPointerMove"
          @pointerleave="hover = null"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @click="onSurfaceClick"
        >
          <g class="viz-grid">
            <line
              v-for="tick in xTicks"
              :key="'gx' + tick"
              :x1="toX(tick)"
              :x2="toX(tick)"
              :y1="MARGIN.top"
              :y2="MARGIN.top + PLOT_HEIGHT"
            />
            <line
              v-for="tick in yTicks"
              :key="'gy' + tick"
              :x1="MARGIN.left"
              :x2="MARGIN.left + PLOT_WIDTH"
              :y1="toY(tick)"
              :y2="toY(tick)"
            />
          </g>

          <g class="viz-axis">
            <line
              :x1="MARGIN.left"
              :x2="MARGIN.left + PLOT_WIDTH"
              :y1="MARGIN.top + PLOT_HEIGHT"
              :y2="MARGIN.top + PLOT_HEIGHT"
            />
            <line :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="MARGIN.top + PLOT_HEIGHT" />
          </g>

          <g class="viz-tick-label">
            <text
              v-for="tick in xTicks"
              :key="'tx' + tick"
              :x="toX(tick)"
              :y="MARGIN.top + PLOT_HEIGHT + 18"
              text-anchor="middle"
            >
              {{ formatTick(tick) }}
            </text>
            <text v-for="tick in yTicks" :key="'ty' + tick" :x="MARGIN.left - 10" :y="toY(tick) + 4" text-anchor="end">
              {{ formatTick(tick) }}
            </text>
          </g>

          <text class="viz-axis-title" :x="MARGIN.left + PLOT_WIDTH / 2" :y="HEIGHT - 6" text-anchor="middle">
            {{ spec.x.label }}
          </text>
          <text
            class="viz-axis-title"
            :transform="'translate(14 ' + (MARGIN.top + PLOT_HEIGHT / 2) + ') rotate(-90)'"
            text-anchor="middle"
          >
            {{ spec.y.label }}
          </text>

          <line
            v-for="line in residualLines"
            :key="line.key"
            :x1="line.x"
            :x2="line.x"
            :y1="line.y1"
            :y2="line.y2"
            :stroke="'var(--series-' + line.slot + ')'"
            stroke-width="1"
            stroke-dasharray="3 3"
            opacity="0.6"
          />

          <path
            v-for="item in paths"
            :key="item.key"
            :d="item.d"
            fill="none"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :stroke="'var(--series-' + item.slot + ')'"
          />

          <line
            v-if="hover && hover.kind === 'curve'"
            :x1="hover.x"
            :x2="hover.x"
            :y1="MARGIN.top"
            :y2="MARGIN.top + PLOT_HEIGHT"
            class="viz-crosshair"
          />

          <!-- meetpunten; de 2px rand in de achtergrondkleur houdt overlap leesbaar -->
          <circle
            v-for="(point, index) in points"
            :key="'p' + index"
            :cx="toX(point.x)"
            :cy="toY(point.y)"
            :r="spec.editable ? 7 : 5"
            fill="var(--series-1)"
            stroke="var(--surface-1)"
            stroke-width="2"
            :class="spec.editable ? 'cursor-grab' : ''"
            @pointerdown="startDrag(index, $event)"
            @dblclick.stop="removePoint(index)"
          />

          <g v-if="hover && hover.kind === 'point'" class="pointer-events-none">
            <rect :x="tooltipX(hover.x, 120)" :y="hover.y - 34" width="120" height="26" rx="4" class="viz-tooltip" />
            <text :x="tooltipX(hover.x, 120) + 10" :y="hover.y - 16" class="viz-tooltip-text">
              x {{ formatTick(hover.point.x) }} · y {{ formatTick(hover.point.y) }}
            </text>
          </g>
          <g v-else-if="hover && hover.kind === 'curve' && hover.rows.length" class="pointer-events-none">
            <rect
              :x="tooltipX(hover.x, 190)"
              :y="MARGIN.top + 8"
              width="190"
              :height="24 + hover.rows.length * 18"
              rx="4"
              class="viz-tooltip"
            />
            <text :x="tooltipX(hover.x, 190) + 10" :y="MARGIN.top + 26" class="viz-tooltip-text">
              {{ spec.x.label }} = {{ formatTick(Number(hover.dataX.toFixed(2))) }}
            </text>
            <g v-for="(row, index) in hover.rows" :key="row.key">
              <circle
                :cx="tooltipX(hover.x, 190) + 15"
                :cy="MARGIN.top + 42 + index * 18 - 4"
                r="3"
                :fill="'var(--series-' + row.slot + ')'"
              />
              <text :x="tooltipX(hover.x, 190) + 24" :y="MARGIN.top + 42 + index * 18" class="viz-tooltip-text">
                {{ row.label }}: {{ formatNumber(row.value, 2) }}
              </text>
            </g>
          </g>
        </svg>
      </div>

      <p v-if="spec.editable" class="px-4 pb-2 text-xs text-gray-500 dark:text-gray-400">
        Sleep een punt om het te verplaatsen, tik op een lege plek om er een toe te voegen, dubbelklik om te
        verwijderen.
      </p>

      <div v-if="spec.fields.length" class="space-y-4 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <div v-for="field in spec.fields" :key="field.name" class="space-y-2">
          <div class="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center">
            <label :for="'p-' + field.name" class="text-sm text-gray-700 dark:text-gray-300">
              {{ field.label }}
            </label>
            <NumberField
              :id="'p-' + field.name"
              v-model="values[field.name]"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :prefix="field.prefix"
              :suffix="field.suffix"
              :label="field.label"
            />
          </div>
          <input
            v-model.number="values[field.name]"
            type="range"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :aria-label="field.label"
            class="doc-range"
          />
        </div>
      </div>

      <dl
        v-if="readouts.length || errors.length"
        class="grid grid-cols-2 gap-x-4 border-t border-gray-200 px-4 py-3 sm:grid-cols-3 dark:border-gray-700"
      >
        <div v-for="readout in readouts" :key="readout.label" class="py-1">
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ readout.label }}</dt>
          <dd class="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{{ readout.display }}</dd>
        </div>
        <div v-for="error in errors" :key="error.key" class="py-1">
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ error.label }} — kwadratische fout</dt>
          <dd class="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ formatNumber(error.sse, 2) }}
          </dd>
        </div>
      </dl>

      <div v-if="showTable && hasData" class="doc-scroll-x border-t border-gray-200 dark:border-gray-700">
        <table class="w-full min-w-max text-sm">
          <!-- Bij één meetpunt zegt een koprij niets; dan alleen de waarden. -->
          <thead v-if="points.length > 1">
            <tr class="bg-gray-50 dark:bg-gray-800/60">
              <th scope="col" class="whitespace-nowrap px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">
                {{ spec.x.label }}
              </th>
              <th scope="col" class="whitespace-nowrap px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">
                {{ spec.y.label }}
              </th>
              <th
                v-for="item in series"
                :key="item.key"
                scope="col"
                class="whitespace-nowrap px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
              >
                {{ item.label }}
              </th>
              <th v-if="spec.editable" scope="col" class="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(point, index) in points" :key="'r' + index" class="border-t border-gray-100 dark:border-gray-800">
              <td class="px-4 py-1.5">
                <span v-if="points.length === 1" class="mr-2 text-gray-500 dark:text-gray-400">
                  {{ spec.x.label }}:
                </span>
                <NumberField
                  v-model="point.x"
                  step="any"
                  :readonly="!spec.editable"
                  :label="spec.x.label"
                  compact
                />
              </td>
              <td class="px-4 py-1.5">
                <span v-if="points.length === 1" class="mr-2 text-gray-500 dark:text-gray-400">
                  {{ spec.y.label }}:
                </span>
                <NumberField
                  v-model="point.y"
                  step="any"
                  :readonly="!spec.editable"
                  :label="spec.y.label"
                  compact
                />
              </td>
              <td
                v-for="item in series"
                :key="item.key"
                class="whitespace-nowrap px-4 py-1.5 font-mono text-gray-700 dark:text-gray-300"
              >
                <span v-if="points.length === 1" class="mr-2 font-sans text-gray-500 dark:text-gray-400">
                  {{ item.label }}:
                </span>
                {{ formatNumber(item.predict(point.x), 2) }}
              </td>
              <td v-if="spec.editable" class="px-4 py-1.5 text-right">
                <button type="button" class="doc-button" @click="removePoint(index)">Verwijderen</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </figure>
</template>

<style scoped>
/* Kleurrollen. De donkere waarden zijn apart gekozen voor de donkere
   achtergrond, niet omgeklapt. */
.viz-root {
  --surface-1: #ffffff;
  --series-1: #2a78d6;
  --series-2: #eb6834;
  --series-3: #1baf7a;
  --grid: #e5e7eb;
  --axis: #d1d5db;
  --ink-muted: #6b7280;
  --tooltip-bg: #111827;
  --tooltip-ink: #f9fafb;
}

:global(.dark) .viz-root {
  --surface-1: #111827;
  --series-1: #3987e5;
  --series-2: #d95926;
  --series-3: #199e70;
  --grid: #1f2937;
  --axis: #374151;
  --ink-muted: #9ca3af;
  --tooltip-bg: #f9fafb;
  --tooltip-ink: #111827;
}

/* Hoogte staat vast, breedte volgt de container: geen layout-sprongen. */
.viz-frame {
  height: 300px;
}

@media (min-width: 640px) {
  .viz-frame {
    height: 380px;
  }
}

.viz-grid line {
  stroke: var(--grid);
  stroke-width: 1;
}

.viz-axis line {
  stroke: var(--axis);
  stroke-width: 1;
}

.viz-tick-label text {
  fill: var(--ink-muted);
  font-size: 11px;
}

.viz-axis-title {
  fill: var(--ink-muted);
  font-size: 12px;
}

.viz-crosshair {
  stroke: var(--axis);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.viz-tooltip {
  fill: var(--tooltip-bg);
  opacity: 0.95;
}

.viz-tooltip-text {
  fill: var(--tooltip-ink);
  font-size: 11px;
}
</style>

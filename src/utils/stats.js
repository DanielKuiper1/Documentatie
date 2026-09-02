/**
 * Ordinary least-squares fit for `y = slope * x + intercept`.
 *
 * Returns `null` for fewer than two points or a vertical point cloud, so
 * callers can fall back rather than draw a line through nothing.
 */
export function linearRegression(points) {
  const usable = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
  const n = usable.length
  if (n < 2) return null

  const meanX = usable.reduce((sum, p) => sum + p.x, 0) / n
  const meanY = usable.reduce((sum, p) => sum + p.y, 0) / n

  let sxx = 0
  let sxy = 0
  let syy = 0
  for (const point of usable) {
    const dx = point.x - meanX
    const dy = point.y - meanY
    sxx += dx * dx
    sxy += dx * dy
    syy += dy * dy
  }
  if (sxx === 0) return null

  const slope = sxy / sxx
  const intercept = meanY - slope * meanX
  const sse = usable.reduce((sum, p) => sum + (p.y - (slope * p.x + intercept)) ** 2, 0)

  return {
    slope,
    intercept,
    // r² is undefined when every y is identical; report a perfect fit instead.
    r2: syy === 0 ? 1 : 1 - sse / syy,
    r: syy === 0 ? 1 : sxy / Math.sqrt(sxx * syy),
    sse,
    n,
    meanX,
    meanY
  }
}

/** Sum of squared residuals of an arbitrary `predict(x)` against the points. */
export function sumSquaredError(points, predict) {
  let total = 0
  for (const point of points) {
    const predicted = predict(point.x)
    if (!Number.isFinite(predicted)) return NaN
    total += (point.y - predicted) ** 2
  }
  return total
}

/** "Nice" axis ticks covering [min, max]. */
export function ticks(min, max, count = 6) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min]
  const rawStep = (max - min) / count
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  // Snap the raw step up to the nearest of 1, 2, 5, 10 x magnitude.
  const step = (normalized > 5 ? 10 : normalized > 2 ? 5 : normalized > 1 ? 2 : 1) * magnitude
  const result = []
  for (let value = Math.ceil(min / step) * step; value <= max + step / 1000; value += step) {
    result.push(Math.round(value / step) * step)
  }
  return result
}

/** Trim float noise for axis labels: 1.2000000000000002 -> "1.2" */
export function formatTick(value) {
  if (!Number.isFinite(value)) return ''
  const rounded = Math.abs(value) < 1e-10 ? 0 : value
  return String(Number(rounded.toPrecision(12)))
}

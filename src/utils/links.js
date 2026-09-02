/**
 * Rewrites Markdown links so `./configuration.md` and `../guides/basics.md`
 * resolve to router paths instead of raw files. External links are untouched.
 */

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i

export function isExternal(href) {
  return EXTERNAL.test(href)
}

/**
 * @param {string} href     link target as written in the Markdown
 * @param {string} fromPath route path of the document containing the link
 */
export function resolveDocLink(href, fromPath) {
  if (!href || isExternal(href) || href.startsWith('#')) return href

  const [target, hash = ''] = splitHash(href)
  if (!/\.md$/i.test(target)) return href

  const base = fromPath.split('/').slice(0, -1) // directory of the current doc
  const segments = target.startsWith('/') ? [''] : base
  const parts = [...segments]

  for (const segment of target.replace(/^\//, '').split('/')) {
    if (segment === '.' || segment === '') continue
    if (segment === '..') parts.pop()
    else parts.push(segment)
  }

  // Volgnummers ("10-installatie") horen bij de bestandsnaam, niet bij de URL.
  let path = parts
    .map((segment) => segment.replace(/^(\d+)[-_]/, ''))
    .join('/')
    .replace(/\.md$/i, '')
  path = path.replace(/\/index$/, '') || '/'
  if (!path.startsWith('/')) path = '/' + path
  return path + hash
}

function splitHash(href) {
  const index = href.indexOf('#')
  return index === -1 ? [href, ''] : [href.slice(0, index), href.slice(index)]
}

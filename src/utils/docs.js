/**
 * Discovers every Markdown file under `docs/` at build time and turns it into
 * a route + sidebar tree. Nothing here is manually registered: adding a file
 * to `docs/` is all it takes.
 */

// Eager so titles/ordering are known up front; docs sites are small enough
// that inlining the Markdown source beats an extra request per page.
const modules = import.meta.glob('../../docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

/** "10-aan-de-slag" -> "Aan de slag" (zinsstijl, zoals in het Nederlands) */
function humanize(segment) {
  const words = stripOrderPrefix(segment).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Leading "12-" / "12_" is used for ordering only, never for the URL. */
function stripOrderPrefix(segment) {
  return segment.replace(/^(\d+)[-_]/, '')
}

function orderOf(segment) {
  const match = segment.match(/^(\d+)[-_]/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

/** First `# Heading` of the document, if it has one. */
function firstHeading(source) {
  const match = source.match(/^\s*#\s+(.+)$/m)
  return match ? match[1].replace(/[*`_]/g, '').trim() : null
}

function toPath(file) {
  const relative = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '')
  const segments = relative.split('/').map(stripOrderPrefix)
  if (segments[segments.length - 1] === 'index') segments.pop()
  return '/' + segments.join('/')
}

export const pages = Object.entries(modules)
  .map(([file, source]) => {
    const relative = file.replace(/^.*\/docs\//, '')
    const segments = relative.replace(/\.md$/, '').split('/')
    return {
      file: relative,
      path: toPath(file),
      source,
      segments,
      title: firstHeading(source) || humanize(segments[segments.length - 1])
    }
  })
  .sort((a, b) => a.path.localeCompare(b.path))

const byPath = new Map(pages.map((page) => [page.path, page]))

export function getPage(path) {
  const normalized = path.replace(/\/+$/, '') || '/'
  return byPath.get(normalized) || byPath.get(path) || null
}

/**
 * Nested sidebar tree mirroring the directory layout.
 * Nodes are `{ type: 'folder', name, title, path, children }` or
 * `{ type: 'page', title, path }`.
 */
export function buildTree() {
  const root = { children: new Map() }

  for (const page of pages) {
    if (page.path === '/') continue // de startpagina hangt al aan de kop
    const parts = [...page.segments]
    const fileName = parts.pop()
    let node = root
    const trail = []

    for (const part of parts) {
      trail.push(stripOrderPrefix(part))
      if (!node.children.has(part)) {
        node.children.set(part, {
          type: 'folder',
          name: part,
          title: humanize(part),
          path: '/' + trail.join('/'),
          order: orderOf(part),
          children: new Map()
        })
      }
      node = node.children.get(part)
    }

    // `index.md` describes its own folder rather than adding a child link.
    if (stripOrderPrefix(fileName) === 'index' && node !== root) {
      node.title = page.title
      node.indexPath = page.path
      continue
    }

    node.children.set(fileName, {
      type: 'page',
      name: fileName,
      title: page.title,
      path: page.path,
      order: orderOf(fileName)
    })
  }

  const materialize = (node) =>
    [...node.children.values()]
      .map((child) => (child.type === 'folder' ? { ...child, children: materialize(child) } : child))
      // Folders first, then explicit numeric order, then alphabetical.
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        if (a.order !== b.order) return a.order - b.order
        return a.title.localeCompare(b.title)
      })

  return materialize(root)
}

export const tree = buildTree()

import MarkdownIt from 'markdown-it'
import katexPlugin from '@vscode/markdown-it-katex'
import hljs from 'highlight.js/lib/common'
import { resolveDocLink, isExternal } from './links.js'

/**
 * Markdown pipeline. `renderDocument()` returns a list of *blocks* instead of
 * one HTML string: plain prose stays HTML (rendered with `v-html`), while
 * fenced code and `interactive` blocks become real Vue components. That keeps
 * the Vue runtime compiler — and any `eval`-like execution of document
 * content — out of the build entirely.
 */

/**
 * Talen die highlight.js niet zelf kent, maar die in documentatie veel
 * voorkomen. Ze worden gekleurd als de taal waar ze het dichtst bij liggen.
 */
const LANGUAGE_ALIASES = {
  vue: 'xml',
  svelte: 'xml',
  jsx: 'javascript',
  tsx: 'typescript',
  mjs: 'javascript',
  cjs: 'javascript',
  zsh: 'bash',
  console: 'bash',
  jsonc: 'json',
  text: null,
  txt: null
}

export function highlight(code, language) {
  const name = Object.prototype.hasOwnProperty.call(LANGUAGE_ALIASES, language)
    ? LANGUAGE_ALIASES[language]
    : language

  if (name && hljs.getLanguage(name)) {
    try {
      return hljs.highlight(code, { language: name, ignoreIllegals: true }).value
    } catch (e) {
      /* valt terug op platte tekst */
    }
  }
  return escapeHtml(code)
}

export function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

const md = new MarkdownIt({
  html: false, // documents are trusted-but-plain: no raw HTML execution paths
  linkify: true,
  typographer: false,
  breaks: false,
  highlight: (code, language) => `<pre class="hljs"><code>${highlight(code, language)}</code></pre>`
})

// The plugin ships as CommonJS; unwrap it so this works under any interop.
md.use(katexPlugin.default ?? katexPlugin)

// Heading anchors, so `file.md#section` links land in the right place.
md.core.ruler.push('heading_anchors', (state) => {
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'heading_open') continue
    const inline = tokens[i + 1]
    const slug = slugify(inline.content)
    if (slug) tokens[i].attrSet('id', slug)
  }
})

// Rewrite `*.md` links to router paths and mark external links.
function linkRule(md) {
  const defaultRender = md.renderer.rules.link_open || ((tokens, i, options, env, self) => self.renderToken(tokens, i, options))
  md.renderer.rules.link_open = (tokens, i, options, env, self) => {
    const token = tokens[i]
    const href = token.attrGet('href')
    if (href) {
      if (isExternal(href)) {
        token.attrSet('target', '_blank')
        token.attrSet('rel', 'noopener noreferrer')
      } else {
        token.attrSet('href', resolveDocLink(href, env.path || '/'))
        token.attrSet('data-internal', 'true')
      }
    }
    return defaultRender(tokens, i, options, env, self)
  }
}
md.use(linkRule)

// Task lists: turn `- [ ] item` into real (disabled) checkboxes.
md.core.ruler.push('task_lists', (state) => {
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'inline') continue
    const parent = tokens[i - 1]
    if (!parent || parent.type !== 'paragraph_open') continue
    const listItem = tokens[i - 2]
    if (!listItem || listItem.type !== 'list_item_open') continue
    const match = tokens[i].content.match(/^\[([ xX])\]\s+/)
    if (!match) continue
    const checked = match[1] !== ' '
    tokens[i].content = tokens[i].content.slice(match[0].length)
    const children = tokens[i].children
    if (children && children[0] && children[0].type === 'text') {
      children[0].content = children[0].content.replace(/^\[([ xX])\]\s+/, '')
    }
    const checkbox = new state.Token('html_inline', '', 0)
    checkbox.content = `<input class="task-checkbox" type="checkbox" disabled${checked ? ' checked' : ''}> `
    children.unshift(checkbox)
    listItem.attrJoin('class', 'task-list-item')
  }
})

const COMPONENT_FENCES = {
  interactive: 'interactive',
  'interactive-table': 'interactive-table',
  plot: 'plot',
  'code-group': 'code-group',
  'python-run': 'python'
}

/**
 * @param {string} source Markdown source
 * @param {string} path   route path of the document (used for link resolution)
 * @returns {Array<{type:'html'|'code'|'interactive'|'interactive-table', ...}>}
 */
export function renderDocument(source, path = '/') {
  const env = { path }
  const tokens = md.parse(source, env)
  const blocks = []
  let buffer = []

  const flush = () => {
    if (!buffer.length) return
    blocks.push({ type: 'html', html: md.renderer.render(buffer, md.options, env) })
    buffer = []
  }

  for (const token of tokens) {
    if (token.type === 'fence' && token.level === 0) {
      const info = (token.info || '').trim().split(/\s+/)[0].toLowerCase()
      if (COMPONENT_FENCES[info]) {
        flush()
        blocks.push({ type: COMPONENT_FENCES[info], source: token.content })
        continue
      }
      flush()
      blocks.push({ type: 'code', language: info, code: token.content.replace(/\n$/, '') })
      continue
    }
    buffer.push(token)
  }
  flush()

  return blocks
}

/** Vlakke lijst met kopjes (h1-h4) voor de "op deze pagina"-navigatie. */
export function extractHeadings(source) {
  const headings = []
  let inFence = false
  // Splitsen op \r\n én \n: documenten met Windows-regeleindes tellen net zo goed.
  for (const line of source.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      const text = match[2].replace(/[*`_]/g, '').trim()
      headings.push({ level: match[1].length, text, slug: slugify(text) })
    }
  }
  return headings
}

/**
 * Nest de kopjes: een h3 hangt onder de h2 erboven, enzovoort. De diepte wordt
 * gemeten vanaf het hoogste niveau dat echt voorkomt, zodat een pagina die met
 * h2 begint niet voor niets inspringt.
 */
export function buildHeadingTree(headings) {
  if (!headings.length) return []
  const base = Math.min(...headings.map((heading) => heading.level))
  const root = []
  const stack = []

  for (const heading of headings) {
    const node = { ...heading, depth: heading.level - base, children: [] }
    while (stack.length && stack[stack.length - 1].level >= heading.level) stack.pop()
    if (stack.length) stack[stack.length - 1].children.push(node)
    else root.push(node)
    stack.push(node)
  }
  return root
}

/** Alle kopjes plat, in documentvolgorde (voor het actieve kopje). */
export function flattenHeadings(tree) {
  return tree.flatMap((node) => [node, ...flattenHeadings(node.children)])
}

export default md

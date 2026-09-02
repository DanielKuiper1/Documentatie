/**
 * A tiny, sandboxed arithmetic expression evaluator.
 *
 * It exists so interactive documentation examples can compute values without
 * ever handing Markdown content to `eval()` / `new Function()`. Only numbers,
 * the variables you pass in and the whitelisted functions below are reachable.
 */

const FUNCTIONS = {
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  sqrt: Math.sqrt,
  exp: Math.exp,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  pow: Math.pow,
  min: Math.min,
  max: Math.max
}

const CONSTANTS = { pi: Math.PI, e: Math.E }

// --- tokenizer -------------------------------------------------------------

const OPERATORS = ['**', '<=', '>=', '==', '!=', '<', '>', '+', '-', '*', '/', '%']

function tokenize(input) {
  const tokens = []
  let i = 0
  while (i < input.length) {
    const char = input[i]
    if (/\s/.test(char)) { i++; continue }
    if (/[0-9.]/.test(char)) {
      let j = i
      while (j < input.length && /[0-9._]/.test(input[j])) j++
      const raw = input.slice(i, j).replace(/_/g, '')
      const value = Number(raw)
      if (Number.isNaN(value)) throw new Error(`Invalid number "${raw}"`)
      tokens.push({ type: 'number', value })
      i = j
      continue
    }
    if (/[A-Za-z_]/.test(char)) {
      let j = i
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++
      tokens.push({ type: 'name', value: input.slice(i, j) })
      i = j
      continue
    }
    if (char === '(' || char === ')' || char === ',' || char === '?' || char === ':') {
      tokens.push({ type: char })
      i++
      continue
    }
    const op = OPERATORS.find((candidate) => input.startsWith(candidate, i))
    if (!op) throw new Error(`Unexpected character "${char}"`)
    tokens.push({ type: 'op', value: op })
    i += op.length
  }
  return tokens
}

// --- parser ----------------------------------------------------------------

// Higher binds tighter. `**` is right-associative, everything else left.
const PRECEDENCE = {
  '<': 1, '>': 1, '<=': 1, '>=': 1, '==': 1, '!=': 1,
  '+': 2, '-': 2,
  '*': 3, '/': 3, '%': 3,
  '**': 4
}

function parse(tokens) {
  let pos = 0

  const peek = () => tokens[pos]
  const next = () => tokens[pos++]
  const expect = (type) => {
    const token = next()
    if (!token || token.type !== type) throw new Error(`Expected "${type}"`)
    return token
  }

  function parseAtom() {
    const token = next()
    if (!token) throw new Error('Unexpected end of expression')
    if (token.type === 'number') return { kind: 'number', value: token.value }
    if (token.type === 'name') {
      if (peek() && peek().type === '(') {
        next()
        const args = []
        if (peek() && peek().type !== ')') {
          do { args.push(parseTernary()) } while (peek() && peek().type === ',' && next())
        }
        expect(')')
        return { kind: 'call', name: token.value, args }
      }
      return { kind: 'name', name: token.value }
    }
    if (token.type === '(') {
      const node = parseTernary()
      expect(')')
      return node
    }
    if (token.type === 'op' && (token.value === '-' || token.value === '+')) {
      return { kind: 'unary', op: token.value, operand: parseAtom() }
    }
    throw new Error(`Unexpected token "${token.value ?? token.type}"`)
  }

  function parseBinary(minPrecedence) {
    let left = parseAtom()
    while (peek() && peek().type === 'op') {
      const op = peek().value
      const precedence = PRECEDENCE[op]
      if (precedence === undefined || precedence < minPrecedence) break
      next()
      const right = parseBinary(op === '**' ? precedence : precedence + 1)
      left = { kind: 'binary', op, left, right }
    }
    return left
  }

  function parseTernary() {
    const condition = parseBinary(1)
    if (peek() && peek().type === '?') {
      next()
      const whenTrue = parseTernary()
      expect(':')
      return { kind: 'ternary', condition, whenTrue, whenFalse: parseTernary() }
    }
    return condition
  }

  const ast = parseTernary()
  if (pos < tokens.length) throw new Error('Trailing input in expression')
  return ast
}

// --- evaluation ------------------------------------------------------------

function evaluate(node, scope) {
  switch (node.kind) {
    case 'number':
      return node.value
    case 'name': {
      const key = node.name
      if (Object.prototype.hasOwnProperty.call(scope, key)) return Number(scope[key])
      if (key in CONSTANTS) return CONSTANTS[key]
      throw new Error(`Unknown variable "${key}"`)
    }
    case 'call': {
      const fn = Object.prototype.hasOwnProperty.call(FUNCTIONS, node.name) ? FUNCTIONS[node.name] : null
      if (!fn) throw new Error(`Unknown function "${node.name}"`)
      return fn(...node.args.map((arg) => evaluate(arg, scope)))
    }
    case 'unary': {
      const value = evaluate(node.operand, scope)
      return node.op === '-' ? -value : value
    }
    case 'ternary':
      return evaluate(node.condition, scope) ? evaluate(node.whenTrue, scope) : evaluate(node.whenFalse, scope)
    case 'binary': {
      const a = evaluate(node.left, scope)
      const b = evaluate(node.right, scope)
      switch (node.op) {
        case '+': return a + b
        case '-': return a - b
        case '*': return a * b
        case '/': return a / b
        case '%': return a % b
        case '**': return a ** b
        case '<': return a < b ? 1 : 0
        case '>': return a > b ? 1 : 0
        case '<=': return a <= b ? 1 : 0
        case '>=': return a >= b ? 1 : 0
        case '==': return a === b ? 1 : 0
        case '!=': return a !== b ? 1 : 0
        default: throw new Error(`Unknown operator "${node.op}"`)
      }
    }
    default:
      throw new Error('Malformed expression')
  }
}

const cache = new Map()

/** Compile `source` once into a reusable `(scope) => number` function. */
export function compile(source) {
  if (!cache.has(source)) cache.set(source, parse(tokenize(source)))
  const ast = cache.get(source)
  return (scope = {}) => evaluate(ast, scope)
}

/** Convenience wrapper: compile and run in one go. Returns NaN on failure. */
export function evaluateExpression(source, scope = {}) {
  try {
    return compile(source)(scope)
  } catch (error) {
    return NaN
  }
}

export const availableFunctions = Object.keys(FUNCTIONS)

import { parse, evaluate, derivative, simplify } from 'mathjs'

export interface IntegralResult {
  /** LaTeX representation of the integral expression */
  integralLatex: string
  /** LaTeX representation of the antiderivative result */
  resultLatex: string
  /** Numeric value for definite integrals */
  numericValue?: number
  /** Whether the computation was successful */
  success: boolean
  /** Error message if unsuccessful */
  error?: string
}

export interface Point {
  x: number
  y: number
}

/**
 * Evaluates a math expression at a given x value.
 * Returns NaN for undefined points (e.g. tan at π/2).
 */
export function evaluateAt(expr: string, x: number): number {
  try {
    const result = evaluate(expr, { x })
    if (typeof result === 'number' && isFinite(result)) {
      return result
    }
    return NaN
  } catch {
    return NaN
  }
}

/**
 * Generates an array of points for plotting a function.
 */
export function generatePoints(
  expr: string,
  xMin: number,
  xMax: number,
  numPoints: number = 500
): Point[] {
  const points: Point[] = []
  const step = (xMax - xMin) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const y = evaluateAt(expr, x)
    points.push({ x: parseFloat(x.toFixed(6)), y })
  }

  return points
}

/**
 * Generates points for the filled area under the curve (definite integral).
 */
export function generateAreaPoints(
  expr: string,
  a: number,
  b: number,
  numPoints: number = 300
): Point[] {
  const points: Point[] = []
  const step = (b - a) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = a + i * step
    const y = evaluateAt(expr, x)
    points.push({ x: parseFloat(x.toFixed(6)), y })
  }

  return points
}

/**
 * Computes the definite integral using composite Simpson's 1/3 rule.
 * n must be even; if odd, it will be incremented by 1.
 */
export function simpsonIntegrate(
  expr: string,
  a: number,
  b: number,
  n: number = 1000
): number {
  if (n % 2 !== 0) n++
  const h = (b - a) / n
  let sum = evaluateAt(expr, a) + evaluateAt(expr, b)

  for (let i = 1; i < n; i++) {
    const x = a + i * h
    const y = evaluateAt(expr, x)
    if (isNaN(y)) return NaN
    sum += (i % 2 === 0 ? 2 : 4) * y
  }

  return (h / 3) * sum
}

// ─── Symbolic Integration Rules ──────────────────────────────────────────────

interface SymbolicRule {
  /** Human-readable name of the rule */
  name: string
  /** Test if this rule applies to the expression */
  match: (expr: string) => boolean
  /** Apply the rule and return the LaTeX antiderivative (without + C) */
  integrate: (expr: string) => string | null
}

/**
 * Normalizes an expression string for consistent matching.
 */
function normalize(expr: string): string {
  return expr.replace(/\s+/g, '').toLowerCase()
}

/**
 * Tries to parse a polynomial term like "3*x^2", "x^5", "-2*x", "x", "7".
 * Returns { coefficient, power } or null.
 */
function parsePolynomialTerm(term: string): { coeff: number; power: number } | null {
  const t = normalize(term)

  // Pure number (constant)
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    return { coeff: parseFloat(t), power: 0 }
  }

  // Patterns for polynomial terms
  const patterns = [
    // a*x^n
    /^(-?\d*\.?\d+)\*x\^(-?\d+\.?\d*)$/,
    // x^n
    /^x\^(-?\d+\.?\d*)$/,
    // a*x
    /^(-?\d*\.?\d+)\*x$/,
    // x (just x)
    /^x$/,
    // -x
    /^-x$/,
  ]

  // a*x^n
  let m = t.match(/^(-?\d*\.?\d+)\*x\^(-?\d+\.?\d*)$/)
  if (m) return { coeff: parseFloat(m[1]), power: parseFloat(m[2]) }

  // x^n
  m = t.match(/^x\^(-?\d+\.?\d*)$/)
  if (m) return { coeff: 1, power: parseFloat(m[1]) }

  // -x^n
  m = t.match(/^-x\^(-?\d+\.?\d*)$/)
  if (m) return { coeff: -1, power: parseFloat(m[1]) }

  // a*x
  m = t.match(/^(-?\d*\.?\d+)\*x$/)
  if (m) return { coeff: parseFloat(m[1]), power: 1 }

  // Just x
  if (t === 'x') return { coeff: 1, power: 1 }
  if (t === '-x') return { coeff: -1, power: 1 }

  return null
}

/**
 * Formats a polynomial antiderivative term as LaTeX.
 */
function formatPolyTermLatex(coeff: number, power: number): string {
  if (power === 0) {
    // integral of constant k → kx
    if (coeff === 1) return 'x'
    if (coeff === -1) return '-x'
    return `${coeff}x`
  }

  const newPower = power + 1
  const newCoeff = coeff / newPower

  // Simplify the fraction
  if (Number.isInteger(newCoeff)) {
    if (newPower === 1) {
      if (newCoeff === 1) return 'x'
      if (newCoeff === -1) return '-x'
      return `${newCoeff}x`
    }
    if (newCoeff === 1) return `x^{${newPower}}`
    if (newCoeff === -1) return `-x^{${newPower}}`
    return `${newCoeff}x^{${newPower}}`
  }

  // Use fraction notation
  const sign = coeff < 0 ? '-' : ''
  const absCoeff = Math.abs(coeff)
  const absNewPower = Math.abs(newPower)

  // Find GCD for simplification
  const g = gcd(absCoeff, absNewPower)
  const num = absCoeff / g
  const den = absNewPower / g

  if (den === 1) {
    if (newPower === 1) return `${sign}${num}x`
    return `${sign}${num}x^{${newPower}}`
  }

  if (num === 1) {
    if (newPower === 1) return `${sign}\\frac{x}{${den}}`
    return `${sign}\\frac{x^{${newPower}}}{${den}}`
  }

  if (newPower === 1) return `${sign}\\frac{${num}x}{${den}}`
  return `${sign}\\frac{${num}x^{${newPower}}}{${den}}`
}

function gcd(a: number, b: number): number {
  a = Math.round(Math.abs(a))
  b = Math.round(Math.abs(b))
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/**
 * Splits expression into additive terms respecting parentheses.
 */
function splitTerms(expr: string): string[] {
  const terms: string[] = []
  let depth = 0
  let current = ''

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i]
    if (ch === '(') depth++
    if (ch === ')') depth--

    if (depth === 0 && (ch === '+' || ch === '-') && i > 0) {
      if (current.trim()) terms.push(current.trim())
      current = ch === '-' ? '-' : ''
    } else {
      current += ch
    }
  }

  if (current.trim()) terms.push(current.trim())
  return terms
}

/**
 * Extracts a constant multiplier from expressions like "3*sin(x)" → { constant: 3, inner: "sin(x)" }
 */
function extractConstantMultiplier(expr: string): { constant: number; inner: string } | null {
  const t = normalize(expr)
  const m = t.match(/^(-?\d+\.?\d*)\*(.+)$/)
  if (m) {
    return { constant: parseFloat(m[1]), inner: m[2] }
  }
  return null
}

/**
 * Tries to symbolically integrate a single "atomic" term.
 */
function integrateAtomicTerm(expr: string): string | null {
  const t = normalize(expr)

  // Check for polynomial term
  const poly = parsePolynomialTerm(expr)
  if (poly) {
    if (poly.power === -1) {
      // ∫ 1/x dx = ln|x|
      if (poly.coeff === 1) return '\\ln|x|'
      if (poly.coeff === -1) return '-\\ln|x|'
      return `${poly.coeff}\\ln|x|`
    }
    return formatPolyTermLatex(poly.coeff, poly.power)
  }

  // sin(x) → -cos(x)
  if (t === 'sin(x)') return '-\\cos(x)'
  // cos(x) → sin(x)
  if (t === 'cos(x)') return '\\sin(x)'
  // tan(x) → -ln|cos(x)|
  if (t === 'tan(x)') return '-\\ln|\\cos(x)|'
  // e^x → e^x
  if (t === 'e^x' || t === 'exp(x)') return 'e^{x}'
  // 1/x → ln|x|
  if (t === '1/x') return '\\ln|x|'

  // sec^2(x) → tan(x)
  if (t === 'sec(x)^2' || t === '(sec(x))^2') return '\\tan(x)'

  return null
}

/**
 * The main symbolic integration function.
 * Handles sums/differences and constant multiples.
 */
function symbolicIntegrate(expr: string): string | null {
  const cleaned = expr.trim()

  // Try direct atomic integration
  const direct = integrateAtomicTerm(cleaned)
  if (direct) return direct

  // Try constant * function: k * f(x)
  const extracted = extractConstantMultiplier(cleaned)
  if (extracted) {
    const innerResult = integrateAtomicTerm(extracted.inner)
    if (innerResult) {
      const c = extracted.constant
      if (c === 1) return innerResult
      if (c === -1) {
        if (innerResult.startsWith('-')) return innerResult.substring(1)
        return `-${innerResult}`
      }
      // Prefix the constant
      if (innerResult.startsWith('-')) {
        return `-${Math.abs(c)} \\cdot ${innerResult.substring(1)}`
      }
      return `${c} \\cdot ${innerResult}`
    }
  }

  // Try sum/difference: split terms
  const terms = splitTerms(normalize(cleaned))
  if (terms.length > 1) {
    const results: string[] = []
    for (const term of terms) {
      const result = symbolicIntegrate(term)
      if (result === null) return null // Can't integrate one term → give up
      results.push(result)
    }
    // Combine terms with proper signs
    let combined = results[0]
    for (let i = 1; i < results.length; i++) {
      const r = results[i]
      if (r.startsWith('-')) {
        combined += ` - ${r.substring(1)}`
      } else {
        combined += ` + ${r}`
      }
    }
    return combined
  }

  return null
}

/**
 * Converts a user expression to a LaTeX representation for the integrand.
 */
function exprToLatex(expr: string): string {
  let latex = expr
    .replace(/\*/g, ' \\cdot ')
    .replace(/sin\(/g, '\\sin(')
    .replace(/cos\(/g, '\\cos(')
    .replace(/tan\(/g, '\\tan(')
    .replace(/log\(/g, '\\log(')
    .replace(/ln\(/g, '\\ln(')
    .replace(/exp\(/g, '\\exp(')
    .replace(/sqrt\(/g, '\\sqrt{')
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/pi/g, '\\pi')

  // Handle sqrt closing braces
  let openSqrt = 0
  let result = ''
  for (let i = 0; i < latex.length; i++) {
    if (latex.substring(i).startsWith('\\sqrt{')) {
      openSqrt++
    }
    if (latex[i] === ')' && openSqrt > 0) {
      result += '}'
      openSqrt--
    } else {
      result += latex[i]
    }
  }

  return result
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Solve an indefinite integral symbolically.
 */
export function solveIndefinite(expr: string): IntegralResult {
  const integrandLatex = exprToLatex(expr)
  const integralLatex = `\\int ${integrandLatex} \\, dx`

  try {
    const result = symbolicIntegrate(expr)
    if (result) {
      return {
        integralLatex,
        resultLatex: `${result} + C`,
        success: true,
      }
    }

    // Fallback: can't find symbolic form
    return {
      integralLatex,
      resultLatex: '\\text{No se pudo resolver simbólicamente}',
      success: false,
      error: 'No se encontró una regla simbólica para esta expresión',
    }
  } catch (e: any) {
    return {
      integralLatex,
      resultLatex: '',
      success: false,
      error: e.message || 'Error al calcular la integral',
    }
  }
}

/**
 * Solve a definite integral (symbolic + numeric).
 */
export function solveDefinite(expr: string, a: number, b: number): IntegralResult {
  const integrandLatex = exprToLatex(expr)
  const integralLatex = `\\int_{${a}}^{${b}} ${integrandLatex} \\, dx`

  try {
    const numericValue = simpsonIntegrate(expr, a, b)

    // Also try symbolic
    const symbolicResult = symbolicIntegrate(expr)
    let resultLatex: string

    if (symbolicResult && !isNaN(numericValue)) {
      resultLatex = `\\left[ ${symbolicResult} \\right]_{${a}}^{${b}} = ${numericValue.toFixed(6)}`
    } else if (!isNaN(numericValue)) {
      resultLatex = `\\approx ${numericValue.toFixed(6)}`
    } else {
      return {
        integralLatex,
        resultLatex: '\\text{La integral diverge o no está definida en el intervalo}',
        success: false,
        error: 'La función no está definida en todo el intervalo',
      }
    }

    return {
      integralLatex,
      resultLatex,
      numericValue,
      success: true,
    }
  } catch (e: any) {
    return {
      integralLatex,
      resultLatex: '',
      success: false,
      error: e.message || 'Error al calcular la integral',
    }
  }
}

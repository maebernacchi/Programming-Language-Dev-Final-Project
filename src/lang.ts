/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable spaced-comment */

/***** Abstract Syntax Tree ***************************************************/

// Expressions

export type Exp = Var | Num | Bool | Lam | App | Ob | Nichts | Schlüssel | Wertwick
export type Var = { tag: 'var', value: string }
export type Num = { tag: 'num', value: number }
export type Bool = { tag: 'bool', value: boolean }
export type Lam = { tag: 'lam', params: string[], body: Exp }
export type App = { tag: 'app', head: Exp, args: Exp[] }
export type Ob = { tag: 'ob', e1: Exp, e2: Exp, e3: Exp }
export type Nichts = { tag: 'null' }
export type Schlüssel = { tag: 'schlüssel', value: string }
export type Wertwick = { tag: 'wertwick', value: Value }

export const evar = (value: string): Var => ({ tag: 'var', value })
export const num = (value: number): Num => ({ tag: 'num', value })
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })
export const lam = (params: string[], body: Exp): Lam => ({ tag: 'lam', params, body })
export const app = (head: Exp, args: Exp[]): App => ({ tag: 'app', head, args })
export const obs = (e1: Exp, e2: Exp, e3: Exp): Ob => ({ tag: 'ob', e1, e2, e3 })
export const nichts: Nichts = ({ tag: 'null' })
export const keyword = (value: string): Schlüssel => ({ tag: 'schlüssel', value })
export const valwrap = (value: Value): Wertwick => ({ tag: 'wertwick', value })

export type Value = Num | Bool | Prim | Schluss | Nichts | Schlüssel | VObjekt
export type Prim = { tag: 'prim', name: string, fn: (args: Value[]) => Value }
export type Schluss = { tag: 'schluss', params: string[], body: Exp, env: Env }
export type VObjekt = { tag: 'objekt', proto: VObjekt | Nichts, value: Map<string, Value> }

export const prim = (name: string, fn: (args: Value[]) => Value): Prim => ({ tag: 'prim', name, fn })
export const schluss = (params: string[], body: Exp, env: Env): Schluss => ({ tag: 'schluss', params, body, env })
export const vobjekt = (proto: VObjekt | Nichts, value: Map<string, Value>): VObjekt => ({ tag: 'objekt', proto, value })

// Statements

export type Stmt = SDefinieren | SDruck
export type SDefinieren = { tag: 'definieren', id: string, exp: Exp }
export type SDruck = { tag: 'druck', exp: Exp }

export const sdefinieren = (id: string, exp: Exp): SDefinieren => ({ tag: 'definieren', id, exp })
export const sprint = (exp: Exp): SDruck => ({ tag: 'druck', exp })

// Programs

export type Prog = Stmt[]

/***** Runtime Environment ****************************************************/

export class Env {
  private outer?: Env
  private bindings: Map<string, Value>

  constructor (bindings?: Map<string, Value>) {
    this.bindings = bindings || new Map()
  }

  has (x: string): boolean {
    return this.bindings.has(x) || (this.outer !== undefined && this.outer.has(x))
  }

  get (x: string): Value {
    if (this.bindings.has(x)) {
      return this.bindings.get(x)!
    } else if (this.outer !== undefined) {
      return this.outer.get(x)
    } else {
      throw new Error(`Laufzeit Fehler: ungebunden Variable '${x}'`)
    }
  }

  set (x: string, v: Value): void {
    if (this.bindings.has(x)) {
      throw new Error(`Laufzeit Fehler: Neudefinition von Variable '${x}'`)
    } else {
      this.bindings.set(x, v)
    }
  }

  update (x: string, v: Value): void {
    this.bindings.set(x, v)
    if (this.bindings.has(x)) {
      this.bindings.set(x, v)
    } else if (this.outer !== undefined) {
      return this.outer.update(x, v)
    } else {
      throw new Error(`Laufzeit Fehler: ungebunden Variable '${x}'`)
    }
  }

  extend1 (x: string, v: Value): Env {
    const ret = new Env()
    ret.outer = this
    ret.bindings = new Map([[x, v]])
    return ret
  }

  extend (xs: string[], vs: Value[]): Env {
    const ret = new Env()
    ret.outer = this
    ret.bindings = new Map(xs.map((x, i) => [x, vs[i]]))
    return ret
  }
}

/***** Pretty-printer *********************************************************/

/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'var': return `${e.value}`
    case 'num': return `${e.value}`
    case 'bool': return e.value ? 'richtig' : 'falsch'
    case 'lam': return `(lambda ${e.params.join(' ')} ${prettyExp(e.body)})`
    case 'app': return `(${prettyExp(e.head)} ${e.args.map(prettyExp).join(' ')})`
    case 'ob': return `(ob ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
    case 'null': return e.tag
    case 'schlüssel': return `${e.value}`
    case 'wertwick': return `${prettyValue(e.value)}`
  }
}

/** @returns a pretty version of the value `v`, suitable for debugging. */
export function prettyValue (v: Value): string {
  switch (v.tag) {
    case 'num': return `${v.value}`
    case 'bool': return v.value ? 'richtig' : 'falsch'
    case 'schluss': return `<schluss>`
    case 'prim': return `<prim ${v.name}>`
    case 'null': return v.tag
    case 'schlüssel': return v.value
    case 'objekt': {
      let ret = '(obj'
      for (const [str, ele] of v.value) {
        ret += ` ${str} ${prettyValue(ele)}`
      }
      ret += ` proto:${prettyValue(v.proto)}`
      ret += ')'
      return ret
    }
  }
}
/** @returns a pretty version of the statement `s`. */
export function prettyStmt (s: Stmt): string {
  switch (s.tag) {
    case 'definieren': return `(definieren ${s.id} ${prettyExp(s.exp)})`
    case 'druck': return `(druck ${prettyExp(s.exp)})`
  }
}

/** @returns a pretty version of the program `p`. */
export function prettyProg (p: Prog): string {
  return p.map(prettyStmt).join('\n')
}

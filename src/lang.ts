/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/***** Abstract Syntax Tree ***************************************************/


/**
 * 
 * Monkey Brain explanation:
 * Thoughts of what I can easily do right now: 
 * Implement field and rec
 * Fix the typechecker and other files to properly parse the field and rec types
 * 
 * Questions I have:
 * Given that I set out to not make an object oriented language, I need assistance with understanding exactly
 * what steps I need to take in order to fully implement everything. 
 * 
 * What parts am I overthinking and what can I do to simplify the process for myself?
 * 
 */
// Types
export type Typ = TyNat | TyBool | TyFeld | TyKlasse | TyRek
export type TyNat = { tag: 'nat' }
export type TyBool = { tag: 'bool' }
export type TyFeld = { tag: 'feld', inputs: Typ[], output: Typ }
export type TyKlasse = { tag: 'klasse', name: string, fields: string[]}
export type TyRek = { tag: 'rekord', inputs: Map<String, Typ>}

export const tynat: Typ = ({ tag: 'nat' })
export const tybool: Typ = ({ tag: 'bool' })
export const tyfeld = (inputs: Typ[], output: Typ): TyFeld => ({ tag: 'feld', inputs, output })
export const tyklasse = (name: string, fields: string[]): TyKlasse => ({ tag: 'klasse', name, fields})
export const tyrek = ( inputs: Map<String, Typ>): TyRek => ({ tag: 'rekord', inputs})

// Expressions
export type Exp = Var | Num | Bool | Nicht | Plus | Gleich | Und | Oder | Falls | SLambda | Nichts | Funktion
export type Var = { tag: 'var', value: string }
export type Num = { tag: 'num', value: number }
export type Bool = { tag: 'bool', value: boolean }
export type Nicht = { tag: 'nicht', e1: Exp }
export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export type Gleich = { tag: 'gleich', e1: Exp, e2: Exp }
export type Und = { tag: 'und', e1: Exp, e2: Exp }
export type Oder = { tag: 'oder', e1: Exp, e2: Exp }
export type Falls = { tag: 'falls', e1: Exp, e2: Exp, e3: Exp }
export type SLambda = { tag: 'lambda', value: string, t: Typ, e1: Exp }
export type Nichts = { tag: 'nichts'}
export type Funktion = { tag: 'funktion', e1: Exp, e2: string}

export const evar = (value: string): Var => ({ tag: 'var', value })
export const num = (value: number): Num => ({ tag: 'num', value })
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })
export const nicht = (e1: Exp): Exp => ({ tag: 'nicht', e1 })
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })
export const gleich = (e1: Exp, e2: Exp): Exp => ({ tag: 'gleich', e1, e2 })
export const und = (e1: Exp, e2: Exp): Exp => ({ tag: 'und', e1, e2 })
export const oder = (e1: Exp, e2: Exp): Exp => ({ tag: 'oder', e1, e2 })
export const falls = (e1: Exp, e2: Exp, e3: Exp): Exp => ({ tag: 'falls', e1, e2, e3 })
export const slambda = (value: string, t: Typ, e1: Exp): Exp => ({ tag: 'lambda', value, t, e1 })
export const nichts = (): Nichts => ({ tag: 'nichts'})
export const funktion = (e1: Exp, e2: string): Exp => ({ tag: 'funktion', e1, e2})

// Values
export type Value = Num | Bool | SLambda | Nichts | Prim | Schluss | Objekt | TyRek
export type Prim = { tag: 'prim', name: string, fn: (args: Value[]) => Value }
export type Schluss = { tag: 'schluss', params: string[], body: Exp, env: Env }
export type Objekt = { tag: 'objekt', proto: Objekt | Nichts, value: Map<string, Value> }

export const prim = (name: string, fn: (args: Value[]) => Value): Prim => ({ tag: 'prim', name, fn })
export const schluss = (params: string[], body: Exp, env: Env): Schluss => ({ tag: 'schluss', params, body, env })
export const objekt = (proto: Objekt | Nichts, value: Map<string, Value>): Objekt => ({ tag: 'objekt', proto, value })

// Statements

// Statements
export type Stmt = SDefinieren | SDruck | SKlasse
export type SDefinieren = { tag: 'definieren', id: string, exp: Exp }
export type SDruck = { tag: 'druck', exp: Exp }
export type SKlasse = { tag: 'klasse', name: string, fields: string[]}

export const sdefinieren = (id: string, exp: Exp): Stmt => ({ tag: 'definieren', id, exp })
export const sdruck = (exp: Exp): Stmt => ({ tag: 'druck', exp })
export const klasse = (name: string, fields: string[]): Stmt => ({ tag: 'klasse', name, fields})

// Programs
export type Prog = Stmt[]

/***** Pretty-printer *********************************************************/
/** @returns a pretty version of the value `v`, suitable for debugging. */
export function prettyValue (v: Value): string {
  switch (v.tag) {
    case 'num': return `${v.value}`
    case 'bool': return v.value ? 'true' : 'false'
    case 'prim': return `<prim ${v.name}>`
    case 'schluss': return `<schluss>`
    case 'objekt': {
      let ret = '(obj'
      for (const [str, ele] of v.value) {
        ret += ` ${str} ${prettyValue(ele)}`
      }
      ret += ` proto:${prettyValue(v.proto)}`
      ret += ')'
      return ret
    }
    default: return `Du hast ein problem mit prettyValue`
  }
}

/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'var': return `${e.value}`
    case 'num': return `${e.value}`
    case 'nichts': return `nichts`
    case 'bool': return e.value ? 'richtig' : 'falsch'
    case 'nicht': return `(nicht ${prettyExp(e.e1)})`
    case 'plus': return `(+ ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'gleich': return `(= ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'und': return `(und ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'oder': return `(oder ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'falls': return `(falls ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
    case 'lambda': return `(lambda (${e.value} ${e.t.tag}) ${prettyExp(e.e1)})`
    case 'funktion': return `(funktion (${e.e1} ${e.e2}))`
    default: return `Du hast ein problem mit prettyExp`
  }
}

function prettyKlasseTyp(e: TyKlasse): string {
  let temp = ''
  for(let i = 0; i < e.fields.length; i++) {
    temp += e.fields[i] + ' '
  }
  temp += ' '
  return temp
}

/** @returns a string of record fields and their types */
function prettyRekTyp(e: TyRek) {
  let temp = ''
  let x = 0
  for(const [key, val] of e.inputs) {
    temp += key + ' '
    temp += prettyTyp(val)
    x++
    if (x < e.inputs.size) {
      temp += ' '
    }
  }
  return temp
}


/** @returns a pretty version of the type `t`. */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'nat': return 'nat'
    case 'bool': return 'bool'
    case 'feld': return `(-> ${t.inputs.map(prettyTyp).join(' ')} ${prettyTyp(t.output)})`
    case 'klasse': return `(klasse ${prettyKlasseTyp(t)})`
    case 'rekord': return `(rekord ${prettyRekTyp(t)})`
  }
}

/**@returns a pretty version of class*/
export function prettyClass (e: SKlasse): string {
  let temp = ''
  for(let i = 0; i < e.fields.length; i++){
    temp += e.fields[i] + ' '
    temp += ' '
  }
  return temp
}

/** @returns a pretty version of the statement `s`. */
export function prettyStmt (s: Stmt): string {
  switch (s.tag) {
    case 'definieren': return `(definieren ${s.id} ${prettyExp(s.exp)})`
    case 'druck': return `(druck ${prettyExp(s.exp)})`
    case 'klasse': return `(klasse ${prettyClass(s)})`
  }
}

/***** Equality ***************************************************************/

/** @returns true iff t1 and t2 are equivalent types */
export function typEquals (t1: Typ, t2: Typ): boolean {
  // N.B., this could be collapsed into a single boolean expression. But we
  // maintain this more verbose form because you will want to follow this
  // pattern of (a) check the tags and (b) recursively check sub-components
  // if/when you add additional types to the language.
  if (t1.tag === 'nat' && t2.tag === 'nat') {
    return true
  } else if (t1.tag === 'bool' && t2.tag === 'bool') {
    return true
  } else if (t1.tag === 'feld' && t2.tag === 'feld') {
    return typEquals(t1.output, t2.output) &&
      t1.inputs.length === t2.inputs.length &&
      t1.inputs.every((t, i) => typEquals(t, t2.inputs[i])) 
  } else return false
}

/***** Environments and Contexts **********************************************/

/** A runtime environment maps names of variables to their bound variables. */
export type Env = Map<string, Value>

/** @returns a copy of `env` with the additional binding `x:v` */
export function extendEnv (x: string, v: Value, env: Env): Env {
  const ret = new Map(env.entries())
  ret.set(x, v)
  return ret
}

/** A context maps names of variables to their types. */
export type Ctx = Map<string, Typ>

/** @returns a copy of `ctx` with the additional binding `x:t` */
export function extendCtx (x: string, t: Typ, ctx: Ctx): Ctx {
  const ret = new Map(ctx.entries())
  ret.set(x, t)
  return ret
}

/***** Substitution ***********************************************************/

/**
 * @param v the value that is being substituted
 * @param x the variable being replaced
 * @param e the expression in which substitution occurs
 * @returns `e` but with every occurrence of `x` replaced with `v`
 */
export function substitute (v: Value, x: string, e: Exp): Exp {
  switch (e.tag) {
    case 'num': return e
    case 'bool': return e
    case 'nichts': return e
    case 'lambda': return e
    case 'nicht': return nicht(substitute(v, x, e.e1))
    case 'plus': return plus(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'gleich': return gleich(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'und': return und(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'oder': return oder(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'falls': return falls(substitute(v, x, e.e1), substitute(v, x, e.e2), substitute(v, x, e.e3))
    default: throw new Error('suchen nach Substitute')
  }
}

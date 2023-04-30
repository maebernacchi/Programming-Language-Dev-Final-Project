/***** Abstract Syntax Tree ***************************************************/
export type Zahl = { tag: 'zahl', value: number }
export const zahl = (value: number): Zahl => ({ tag: 'zahl', value })

export type Bool = { tag: 'bool', value: boolean }
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })

export type Nicht = { tag: 'nicht', exp: Exp }
export const nicht = (exp: Exp): Exp => ({ tag: 'nicht', exp })

export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })

export type Gleich = { tag: 'gleich', e1: Exp, e2: Exp }
export const gleich = (e1: Exp, e2: Exp): Exp => ({ tag: 'gleich', e1, e2 })

export type Und = { tag: 'und', e1: Exp, e2: Exp }
export const und = (e1: Exp, e2: Exp): Exp => ({ tag: 'und', e1, e2 })

export type Sonst = { tag: 'sonst', e1: Exp, e2: Exp }
export const sonst = (e1: Exp, e2: Exp): Exp => ({ tag: 'sonst', e1, e2 })

export type Nichts = { tag: 'null' }
export const nichts = ({ tag: 'null'})

export type Ob = { tag: 'ob', e1: Exp, e2: Exp, e3: Exp }
export const ob = (e1: Exp, e2: Exp, e3: Exp): Exp =>
  ({ tag: 'ob', e1, e2, e3 })

export type Exp = Zahl | Bool | Nicht | Plus | Gleich | Und | Sonst | Nichts | Ob 
export type Value = Zahl | Bool | Nichts

export type TyNat = { tag: 'nat' }
export const tynat: Typ = ({ tag: 'nat' })

export type TyBool = { tag: 'bool' }
export const tybool: Typ = ({ tag: 'bool' })

export type TyNichts = { tag: 'null' }
export const tynichts: Typ = ({ tag: 'null'})

export type Typ = TyNat | TyBool | TyNichts

/***** Pretty-printer *********************************************************/

/**
 * @returns a pretty version of the expression `e`, suitable for debugging.
 */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'zahl': return `${e.value}`
    case 'bool': return e.value ? 'true' : 'false'
    case 'nicht': return `(nicht ${prettyExp(e.exp)})`
    case 'plus': return `(+ ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'gleich': return `(= ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'und': return `(und ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'sonst': return `(sonst ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'null' : return e.tag
    case 'ob': return `(ob ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
  }
}

/**
 * @returns a pretty version of the type `t`.
 */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'nat': return 'nat'
    case 'bool': return 'bool'
    case 'null': return 'null'
  }
}

/***** Evaluator **************************************************************/

/**
 * @returns the value that expression `e` evaluates to.
 */
export function evaluate (e: Exp): Value {
  switch (e.tag) {
    case 'zahl':
      return e
    case 'bool':
      return e
    case 'null':
      return e
    case 'nicht': {
      const v = evaluate(e)
      if (v.tag === 'bool') {
        return bool(!v.value)
      } else {
        throw new Error(`Type error: negation expects a boolean but a ${v.tag} was given.`)
      }
    }
    case 'plus': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'zahl' && v2.tag === 'zahl') {
        return zahl(v1.value + v2.value)
      } else {
        throw new Error(`Type error: plus expects two numbers but a ${v1.tag} und ${v2.tag} was given.`)
      }
    }
    case 'gleich': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      return bool(v1 === v2)
    }
    case 'und': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return bool(v1.value && v2.value)
      } else {
        throw new Error(`Type error: && expects two booleans but a ${v1.tag} und ${v2.tag} was given.`)
      }
    }
    case 'sonst': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return bool(v1.value || v2.value)
      } else {
        throw new Error(`Type error: || expects two booleans but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'ob': {
      const v = evaluate(e.e1)
      if (v.tag === 'bool') {
        return v.value ? evaluate(e.e2) : evaluate(e.e3)
      } else {
        throw new Error(`Type error: if expects a boolean in guard position but a ${v.tag} was given.`)
      }
    }
  }
}

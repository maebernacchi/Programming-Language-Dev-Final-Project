/* **** Abstract Syntax Tree ***************************************************/ 
export type Exp = Zahl | Bool | Nicht | Plus | Gleich | Und | Sonst | Nichts | Ob
export type Zahl = { tag: 'zahl', value: number }
export type Bool = { tag: 'bool', value: boolean }
export type Nicht = { tag: 'nicht', exp: Exp }
export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export type Gleich = { tag: 'gleich', e1: Exp, e2: Exp }
export type Und = { tag: 'und', e1: Exp, e2: Exp }
export type Sonst = { tag: 'sonst', e1: Exp, e2: Exp }
export type Nichts = { tag: 'null' }
export type Ob = { tag: 'ob', e1: Exp, e2: Exp, e3: Exp }

export const zahl = (value: number): Zahl => ({ tag: 'zahl', value })
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })
export const nicht = (exp: Exp): Exp => ({ tag: 'nicht', exp })
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })
export const gleich = (e1: Exp, e2: Exp): Exp => ({ tag: 'gleich', e1, e2 })
export const und = (e1: Exp, e2: Exp): Exp => ({ tag: 'und', e1, e2 })
export const sonst = (e1: Exp, e2: Exp): Exp => ({ tag: 'sonst', e1, e2 })
export const nichts = ({ tag: 'null'})
export const ob = (e1: Exp, e2: Exp, e3: Exp): Exp => ({ tag: 'ob', e1, e2, e3 })

export type Value = Zahl | Bool | Nichts
export type Typ = TyNat | TyBool | TyNichts
export type TyNat = { tag: 'nat' }
export type TyBool = { tag: 'bool' }
export type TyNichts = { tag: 'null' }

export const tynat: Typ = ({ tag: 'nat' })
export const tybool: Typ = ({ tag: 'bool' })
export const tynichts: Typ = ({ tag: 'null'})

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
        throw new Error(`Typ fehler: nicht erwartet ein booleschen Wert, aber ein ${v.tag} gegeben war.`)
      }
    }
    case 'plus': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'zahl' && v2.tag === 'zahl') {
        return zahl(v1.value + v2.value)
      } else {
        throw new Error(`Typ fehler: plus erwartet zwei Zahlen aber ein ${v1.tag} und ein ${v2.tag} gegeben war.`)
      }
    }
    case 'gleich': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if(v1.tag !== v2.tag){
        throw new Error(`Typ fehler: gleich erwartet ahnliches Typen, aber ein ${v1.tag} und ein ${v2.tag} gegeben war`)
      } else {
        return bool(v1 === v2)
      }
    }
    case 'und': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return bool(v1.value && v2.value)
      } else {
        throw new Error(`Typ fehler: && erwartet zwei booleschen Werten aber ein ${v1.tag} und ein ${v2.tag} gegeben war.`)
      }
    }
    case 'sonst': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return bool(v1.value || v2.value)
      } else {
        throw new Error(`Typ fehler: || erwartet zwei booleschen Werten aber ein ${v1.tag} und ein ${v2.tag} gegeben war.`)
      }
    }
    case 'ob': {
      const v = evaluate(e.e1)
      if (v.tag === 'bool') {
        return v.value ? evaluate(e.e2) : evaluate(e.e3)
      } else {
        throw new Error(`Typ fehler: ob erwartet ein booleschen Wert, aber ein ${v.tag} gegeben war.`)
      }
    }
  }
}

/**
* This code was taken from Lab 4 from CSC-312. I will make edits when given the chance
*/

/***** Abstract Syntax Tree ***************************************************/
export type Num = { tag: 'num', value: number }
export const num = (value: number): Num => ({ tag: 'num', value })

export type Bool = { tag: 'bool', value: boolean }
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })

export type Not = { tag: 'not', exp: Exp }
export const not = (exp: Exp): Exp => ({ tag: 'not', exp })

export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })

export type Eq = { tag: 'eq', e1: Exp, e2: Exp }
export const eq = (e1: Exp, e2: Exp): Exp => ({ tag: 'eq', e1, e2 })

export type And = { tag: 'and', e1: Exp, e2: Exp }
export const and = (e1: Exp, e2: Exp): Exp => ({ tag: 'and', e1, e2 })

export type Or = { tag: 'or', e1: Exp, e2: Exp }
export const or = (e1: Exp, e2: Exp): Exp => ({ tag: 'or', e1, e2 })

export type If = { tag: 'if', e1: Exp, e2: Exp, e3: Exp }
export const ife = (e1: Exp, e2: Exp, e3: Exp): Exp =>
  ({ tag: 'if', e1, e2, e3 })

export type Pair = { tag: 'pair', e1: Value, e2: Value}
export const pair = (e1: Value, e2: Value): Value => ({ tag: 'pair', e1, e2})

export type Fst = { tag: 'fst', e: Exp}
export const fst = (e: Exp): Exp => ({ tag: 'fst', e})

export type Snd = { tag: 'snd', e: Exp}
export const snd = (e: Exp): Exp => ({ tag: 'snd', e})

export type Unit = { tag: 'unit'}
export const unit: Unit = ({tag: 'unit' }) 

export type Exp = Num | Bool | Not | Plus | Eq | And | Or | If | Unit | Pair | Fst | Snd
export type Value = Num | Bool | Unit | Pair

export type TyNat = { tag: 'nat' }
export const tynat: Typ = ({ tag: 'nat' })

export type TyBool = { tag: 'bool' }
export const tybool: Typ = ({ tag: 'bool' })

export type TyUnit = { tag: 'unit'}
export const tyunit: TyUnit = ({tag: 'unit' })  

export type TyPair = { tag: 'pair'}
export const typair: TyPair = ({tag: 'pair' }) 

export type Typ = TyNat | TyBool | TyUnit | TyPair

/***** Pretty-printer *********************************************************/

/**
 * @returns a pretty version of the expression `e`, suitable for debugging.
 */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'num': return `${e.value}`
    case 'bool': return e.value ? 'true' : 'false'
    case 'unit': return `${e.tag}`
    case 'not': return `(not ${prettyExp(e.exp)})`
    case 'plus': return `(+ ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'eq': return `(= ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'and': return `(and ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'or': return `(or ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'if': return `(if ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
    case 'pair': return `(pair ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'fst': return `(fst ${prettyExp(e.e)})`
    case 'snd': return `(snd ${prettyExp(e.e)})`
  }
}

/**
 * @returns a pretty version of the type `t`.
 */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'nat': return 'nat'
    case 'bool': return 'bool'
    case 'unit': return 'unit'
    case 'pair': return 'pair'
  }
}

/***** Evaluator **************************************************************/

/**
 * @returns the value that expression `e` evaluates to.
 */
export function evaluate (e: Exp): Value {
  switch (e.tag) {
    case 'num':
      return e
    case 'bool':
      return e
    case 'unit': 
      return e
    case 'pair':{
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      return pair(v1, v2)
    }
    case 'fst':{
      const f = evaluate(e.e)
      if(f.tag === 'pair'){
        return evaluate(f.e1)
        } else {
        throw new Error(`Type error: Expected a pair but a ${f.tag} was given`)
      }
      }
    case 'snd':{
      const s = evaluate(e.e)
      if (s.tag === 'pair') {
        return evaluate(s.e2)
      } else {
        throw new Error(`Type error: Expected a pair but a ${s.tag} was given`)
      }
    }
    case 'not': {
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
      if (v1.tag === 'num' && v2.tag === 'num') {
        return num(v1.value + v2.value)
      } else {
        throw new Error(`Type error: plus expects two numbers but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'eq': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      return bool(v1 === v2)
    }
    case 'and': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return bool(v1.value && v2.value)
      } else {
        throw new Error(`Type error: && expects two booleans but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'or': {
      const v1 = evaluate(e.e1)
      const v2 = evaluate(e.e2)
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return bool(v1.value || v2.value)
      } else {
        throw new Error(`Type error: || expects two booleans but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'if': {
      const v = evaluate(e.e1)
      if (v.tag === 'bool') {
        return v.value ? evaluate(e.e2) : evaluate(e.e3)
      } else {
        throw new Error(`Type error: if expects a boolean in guard position but a ${v.tag} was given.`)
      }
    }
  }
}

/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/***** Abstract Syntax Tree ***************************************************/

// Types
export type Typ = TyNat | TyBool | TyArr
export type TyNat = { tag: 'nat' }
export type TyBool = { tag: 'bool' }
export type TyArr = { tag: 'arr', t1: Typ, t2: Typ }
export const tynat: Typ = ({ tag: 'nat' })
export const tybool: Typ = ({ tag: 'bool' })
export const tyarr = (t1: Typ, t2: Typ): Typ => ({ tag: 'arr', t1, t2 })

// Expressions
export type Exp = Var | Num | Bool | Not | Plus | Eq | And | Or | If | SLambda

export type Var = { tag: 'var', value: string }
export type Num = { tag: 'num', value: number }
export type Bool = { tag: 'bool', value: boolean }
export type Not = { tag: 'not', e1: Exp }
export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export type Eq = { tag: 'eq', e1: Exp, e2: Exp }
export type And = { tag: 'and', e1: Exp, e2: Exp }
export type Or = { tag: 'or', e1: Exp, e2: Exp }
export type If = { tag: 'if', e1: Exp, e2: Exp, e3: Exp }
export type SLambda = { tag: 'lambda', value: string, t: Typ, e1: Exp }

export const evar = (value: string): Var => ({ tag: 'var', value })
export const num = (value: number): Num => ({ tag: 'num', value })
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })
export const not = (e1: Exp): Exp => ({ tag: 'not', e1 })
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })
export const eq = (e1: Exp, e2: Exp): Exp => ({ tag: 'eq', e1, e2 })
export const and = (e1: Exp, e2: Exp): Exp => ({ tag: 'and', e1, e2 })
export const or = (e1: Exp, e2: Exp): Exp => ({ tag: 'or', e1, e2 })
export const ife = (e1: Exp, e2: Exp, e3: Exp): Exp => ({ tag: 'if', e1, e2, e3 })
export const slambda = (value: string, t: Typ, e1: Exp): Exp => ({ tag: 'lambda', value, t, e1 })

// Values

export type Value = Num | Bool | SLambda

// Statements

export type SDefine = { tag: 'define', id: string, exp: Exp }
export const sdefine = (id: string, exp: Exp): Stmt => ({ tag: 'define', id, exp })

export type SPrint = { tag: 'print', exp: Exp }
export const sprint = (exp: Exp): Stmt => ({ tag: 'print', exp })

export type Stmt = SDefine | SPrint

// Programs

export type Prog = Stmt[]

/***** Pretty-printer *********************************************************/

/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'var': return `${e.value}`
    case 'num': return `${e.value}`
    case 'bool': return e.value ? 'true' : 'false'
    case 'not': return `(not ${prettyExp(e.e1)})`
    case 'plus': return `(+ ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'eq': return `(= ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'and': return `(and ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'or': return `(or ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'if': return `(if ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
    case 'lambda': return `(lambda (${e.value} ${e.t.tag}) ${prettyExp(e.e1)})`
  }
}

/** @returns a pretty version of the type `t`. */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'nat': return 'nat'
    case 'bool': return 'bool'
    case 'arr': return 'arr'
  }
}

/** @returns a pretty version of the statement `s`. */
export function prettyStmt (s: Stmt): string {
  switch (s.tag) {
    case 'define': return `(define ${s.id} ${prettyExp(s.exp)})`
    case 'print': return `(print ${prettyExp(s.exp)})`
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
  } else if (t1.tag === 'arr' && t2.tag === 'arr') {
    return typEquals(t1.t1, t2.t1) && typEquals(t1.t2, t2.t2)
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
    case 'var': return (x === e.value) ? v : e
    case 'not': return not(substitute(v, x, e.e1))
    case 'plus': return plus(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'eq': return eq(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'and': return and(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'or': return or(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'if': return ife(substitute(v, x, e.e1), substitute(v, x, e.e2), substitute(v, x, e.e3))
    default: throw new Error('what did you break bro??? check substitute')
  }
}

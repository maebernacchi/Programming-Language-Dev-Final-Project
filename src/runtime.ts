/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/consistent-generic-constructors */
/* eslint-disable @typescript-eslint/object-curly-spacing */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import * as L from './lang'

/** The output of our programs: a list of strings that our program printed. */
export type Output = string[]

/** @return `f` but as a function that takes an array instead of 1 argument */
function wrap1<T> (f: (_x: T) => T): (_args: T[]) => T {
  return (args) => f(args[0])
}

/** @return `f` but as a function that takes an array instead of 2 arguments */
function wrap2<T> (f: (_x1: T, _x2: T) => T): (_args: T[]) => T {
  return (args) => f(args[0], args[1])
}

/** @return `f` but as a function that takes an array instead of 3 arguments */
function wrap3<T> (f: (_x1: T, _x2: T, _x3: T) => T): (_args: T[]) => T {
  return (args) => f(args[0], args[1], args[2])
}

/** An entry of the operator table. */
type OpEntry = { arity: number, ctor: (_args: L.Exp[]) => L.Exp }

const operatorMap: Map<string, OpEntry> =
  new Map([
    ['not', { arity: 1, ctor: wrap1(L.not) }],
    ['plus', { arity: 2, ctor: wrap2(L.plus) }],
    ['eq', { arity: 2, ctor: wrap2(L.eq) }],
    ['and', { arity: 2, ctor: wrap2(L.and) }],
    ['or', { arity: 2, ctor: wrap2(L.or) }],
    ['if', { arity: 3, ctor: wrap3(L.ife)}]
  ])

/** @returns the value that expression `e` evaluates to. */
export function evaluate (e: L.Exp, viro: L.Env): L.Value {
  switch (e.tag) {
    case 'var': {
      if (viro.has(e.value)) {
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
        // @ts-ignore
        return viro.get(e.value)
      } else {
        throw new Error(`Variable error: No defined value for ${e.value}`)
      }
    }
    case 'num':
      return e
    case 'bool':
      return e
    case 'lambda':
      return e
  }

  const argnums = operatorMap.get(e.tag)!.arity

  const v1 = evaluate(e.e1, viro)
  let v2: L.Value = L.num(0)
  let v3: L.Value = L.num(0)
  if (argnums >= 2) { // @ts-ignore
    v2 = evaluate(e.e2, viro)
  }
  if (argnums === 3) { // @ts-ignore
    v3 = evaluate(e.e3, viro)
  }

  switch (e.tag) {
    case 'not': {
      if (v1.tag === 'bool') {
        return L.bool(!v1.value)
      } else {
        throw new Error(`Type error: negation expects a boolean but a ${v1.tag} was given.`)
      }
    }
    case 'plus': {
      if (v1.tag === 'num' && v2.tag === 'num') {
        return L.num(v1.value + v2.value)
      } else {
        throw new Error(`Type error: plus expects two numbers but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'eq': {
      return L.bool(v1.value === v2.value)
    }
    case 'and': {
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return L.bool(v1.value && v2.value)
      } else {
        throw new Error(`Type error: && expects two booleans but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'or': {
      if (v1.tag === 'bool' && v2.tag === 'bool') {
        return L.bool(v1.value || v2.value)
      } else {
        throw new Error(`Type error: || expects two booleans but a ${v1.tag} and ${v2.tag} was given.`)
      }
    }
    case 'if': {
      if (v1.tag === 'bool') {
        return v1.value ? v2 : v3
      } else {
        throw new Error(`Type error: 'if' expects a boolean in guard position but a ${v1.tag} was given.`)
      }
    }
    default:
      throw new Error('dunno bro')
  }
}

/** @returns the result of executing program `prog` */
export function execute (env: L.Env, prog: L.Prog): Output {
  const stringouts: string[] = []
  for (let i = 0; i < prog.length; i++) {
    const e = prog[i]
    if (e.tag === 'define') {
      env = L.extendEnv(e.id, evaluate(e.exp, env), env)
    } else if (e.tag === 'print') {
      const printed: L.Value = evaluate(e.exp, env)
      stringouts.push(String(printed.value))
    } else {
      throw new Error('This is not a statement dumdum')
    }
  }
  return stringouts
}

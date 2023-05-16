/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-generic-constructors */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import * as S from './sexp'
import * as L from './lang'

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

/** A mapping from function symbols to AST constructors for those functions */
const operatorMap: Map<string, OpEntry> =
  new Map([
    ['nicht', { arity: 1, ctor: wrap1(L.nicht) }],
    ['+', { arity: 2, ctor: wrap2(L.plus) }],
    ['=', { arity: 2, ctor: wrap2(L.gleich) }],
    ['und', { arity: 2, ctor: wrap2(L.und) }],
    ['oder', { arity: 2, ctor: wrap2(L.oder) }],
    ['falls', { arity: 3, ctor: wrap3(L.falls) }]
  ])

/** @returns the expression parsed from the given s-expression. */
export function translateExp (e: S.Sexp): L.Exp {
  if (e.tag === 'atom') {
    if (e.value === 'true') {
      return L.bool(true)
    } else if (e.value === 'false') {
      return L.bool(false)
    } else if (/\d+$/.test(e.value)) {
      return L.num(parseInt(e.value))
    } else {
      // N.B., any other chunk of text will be considered a variable
      return L.evar(e.value)
    }
  } else if (e.exps.length === 0) {
    throw new Error('Parse error: empty expression list encountered')
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag !== 'atom') {
      throw new Error('Parse error: identifier expected at head of operator/form')
    } else if (operatorMap.has(head.value)) {
      return operatorMap.get(head.value)!.ctor(args.map(translateExp))
    } else {
      throw new Error(`Parse error: invalid operator given '${head.value}'`)
    }
  }
}

export function translateStmt (e: S.Sexp): L.Stmt {
  if (e.tag === 'atom') {
    throw new Error(`Parse error: an atom cannot be a statement: '${e.value}'`)
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag !== 'atom') {
      throw new Error('Parse error: identifier expected at head of operator/form')
    } else if (head.value === 'define') {
      if (args.length !== 2) {
        throw new Error(`Parse error: 'define' expects 2 argument but ${args.length} were given`)
      } else if (args[0].tag !== 'atom') {
        throw new Error("Parse error: 'define' expects its first argument to be an identifier")
      } else {
        return L.sdefine(args[0].value, translateExp(args[1]))
      }
    } else if (head.value === 'print') {
      throw new Error(`Parse error: 'display' expects 1 argument but ${args.length} were given`)
    } else {
      return L.sprint(translateExp(args[0]))
    }
  }
}

export function translateProg (es: S.Sexp[]): L.Prog {
  const ret: L.Stmt[] = []
  for (let i = 0; i < es.length; i++) {
    ret.push(translateStmt(es[i]))
  }
  return ret
}

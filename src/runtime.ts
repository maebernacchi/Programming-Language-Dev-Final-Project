/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-generic-constructors */
import * as L from './lang'

function throwArityError (fn: string, expected: number, found: number): never {
  throw new Error(`Runtime error: '${fn}' expects ${expected} argument(s) but ${found} were given`)
}

function throwUnexpectedError (fn: string, expected: string, pos: number, found: string): never {
  throw new Error(`Type error: primitive '${fn}' expected ${expected} in position ${pos} but a ${found} was given`)
}

function checkBinaryArithOp (op: string, args: L.Value[]): [number, number] {
  if (args.length !== 2) {
    throwArityError('+', 2, args.length)
  } else {
    const v1 = args[0]
    const v2 = args[1]
    if (v1.tag !== 'num') {
      throwUnexpectedError('+', 'number', 1, v1.tag)
    } else if (v2.tag !== 'num') {
      throwUnexpectedError('+', 'number', 2, v2.tag)
    } else {
      return [v1.value, v2.value]
    }
  }
}

function plusPrim (args: L.Value[]): L.Value {
  const [n1, n2] = checkBinaryArithOp('+', args)
  return L.num(n1 + n2)
}

function subPrim (args: L.Value[]): L.Value {
  const [n1, n2] = checkBinaryArithOp('-', args)
  return L.num(n1 - n2)
}

function timesPrim (args: L.Value[]): L.Value {
  const [n1, n2] = checkBinaryArithOp('*', args)
  return L.num(n1 * n2)
}

function divPrim (args: L.Value[]): L.Value {
  const [n1, n2] = checkBinaryArithOp('/', args)
  return L.num(n1 / n2)
}

function zeroPrim (args: L.Value[]): L.Value {
  if (args.length !== 1) {
    throwArityError('zero?', 1, args.length)
  } else {
    const v = args[0]
    if (v.tag !== 'num') {
      throwUnexpectedError('zero?', 'number', 1, v.tag)
    } else {
      return L.bool(v.value === 0)
    }
  }
}

function objPrim (args: L.Value[]): L.Value {
  if (args.length % 2 !== 0) {
    throw new Error(`Runtime error: obj, expects an even number of arguments but ${args.length} were given`)
  } else {
    const vals: string[] = ['num', 'bool', 'prim', 'closure', 'keyword']
    const ret: Map<string, L.Value> = new Map([])
    for (let i = 0; i < args.length; i += 2) {
      const e1 = args[i]
      const e2 = args[i + 1]
      if (e1.tag !== 'keyword') {
        throwUnexpectedError('obj', 'keyword', i, e1.tag)
      } else if (!vals.includes(args[i + 1].tag)) {
        throwUnexpectedError('obj', 'Value', i + 1, e2.tag)
      } else {
        ret.set(e1.value, e2)
      }
    }
    return L.vobject(L.nole, ret)
  }
}

function fiePrim (args: L.Value[]): L.Value {
  if (args.length !== 2) {
    throwArityError('field', 2, args.length)
  } else {
    let o = args[0]
    const f = args[1]
    if (o.tag !== 'object') {
      throwUnexpectedError('field', 'obj', 0, o.tag)
    } else if (f.tag !== 'keyword') {
      throwUnexpectedError('field', 'keyword', 1, f.tag)
    } else if (o.value.has(f.value)) {
      return o.value.get(f.value)!
    } else {
      while (o.proto.tag !== 'null') {
        o = o.proto
        if (o.tag === 'object' && o.value.has(f.value)) {
          return o.value.get(f.value)!
        }
      }
      throw new Error(`${f.value} does not exist in ${o} or its prototypes.`)
    }
  }
}

export function makeInitialEnv (): L.Env {
  return new L.Env(new Map([
    ['+', L.prim('+', plusPrim)],
    ['-', L.prim('-', subPrim)],
    ['*', L.prim('*', timesPrim)],
    ['/', L.prim('/', divPrim)],
    ['zero?', L.prim('zero?', zeroPrim)],
    ['obj', L.prim('obj', objPrim)],
    ['field', L.prim('field', fiePrim)]
  ]))
}

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-generic-constructors */
import * as L from './lang'

function throwArityError (fn: string, expected: number, found: number): never {
  throw new Error(`Laufzeit Fehler: '${fn}' erwartet ${expected} Argument(e) aber ${found} war gegeben`)
}

function throwUnexpectedError (fn: string, expected: string, pos: number, found: string): never {
  throw new Error(`Typ Fehler: Primitive '${fn}' erwartet ${expected} in Lage ${pos} aber ein ${found} war gegeben`)
}

function checkBinaryArithOp (op: string, args: L.Value[]): [number, number] {
  if (args.length !== 2) {
    throwArityError('+', 2, args.length)
  } else {
    const v1 = args[0]
    const v2 = args[1]
    if (v1.tag !== 'num') {
      throwUnexpectedError('+', 'nummer', 1, v1.tag)
    } else if (v2.tag !== 'num') {
      throwUnexpectedError('+', 'nummer', 2, v2.tag)
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
    throwArityError('null?', 1, args.length)
  } else {
    const v = args[0]
    if (v.tag !== 'num') {
      throwUnexpectedError('null?', 'nummer', 1, v.tag)
    } else {
      return L.bool(v.value === 0)
    }
  }
}

function objPrim (args: L.Value[]): L.Value {
  if (args.length % 2 !== 0) {
    throw new Error(`Laufzeit Fehler: Objekt, erwartet ein gerade nummber Argumente ${args.length} war gegeben`)
  } else {
    const vals: string[] = ['num', 'bool', 'prim', 'closure', 'keyword']
    const ret: Map<string, L.Value> = new Map([])
    for (let i = 0; i < args.length; i += 2) {
      const e1 = args[i]
      const e2 = args[i + 1]
      if (e1.tag !== 'schlüssel') {
        throwUnexpectedError('obj', 'schlüssel', i, e1.tag)
      } else if (!vals.includes(args[i + 1].tag)) {
        throwUnexpectedError('obj', 'Value', i + 1, e2.tag)
      } else {
        ret.set(e1.value, e2)
      }
    }
    return L.vobjekt(L.nichts, ret)
  }
}

function fiePrim (args: L.Value[]): L.Value {
  if (args.length !== 2) {
    throwArityError('field', 2, args.length)
  } else {
    let o = args[0]
    const f = args[1]
    if (o.tag !== 'objekt') {
      throwUnexpectedError('field', 'obj', 0, o.tag)
    } else if (f.tag !== 'schlüssel') {
      throwUnexpectedError('field', 'keyword', 1, f.tag)
    } else if (o.value.has(f.value)) {
      return o.value.get(f.value)!
    } else {
      while (o.proto.tag !== 'null') {
        o = o.proto
        if (o.tag === 'objekt' && o.value.has(f.value)) {
          return o.value.get(f.value)!
        }
      }
      throw new Error(`${f.value} existiert nicht in ${o} oder ihrer Prototypen.`)
    }
  }
}

export function makeInitialEnv (): L.Env {
  return new L.Env(new Map([
    ['+', L.prim('+', plusPrim)],
    ['-', L.prim('-', subPrim)],
    ['*', L.prim('*', timesPrim)],
    ['/', L.prim('/', divPrim)],
    ['null?', L.prim('null?', zeroPrim)],
    ['obj', L.prim('obj', objPrim)],
    ['field', L.prim('field', fiePrim)]
  ]))
}

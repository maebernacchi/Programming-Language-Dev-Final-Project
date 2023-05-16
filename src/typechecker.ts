/* eslint-disable @typescript-eslint/space-before-blocks */
import * as L from './lang'

function expectedTypeMsg (expected: string, pos: number, fn: string, found: string): string {
  return `Type error: Expected ${expected} in position ${pos} of ${fn} but found ${found}`
}

/** @return the type of expression `e` */
export function typecheck (ctx: L.Ctx, e: L.Exp): L.Typ {
  switch (e.tag) {
    case 'var':
      throw new Error('TODO: implement typecheck(var)!')
    case 'num':
      return L.tynat
    case 'bool':
      return L.tybool
    case 'nicht': {
      const t = typecheck(ctx, e.e1)
      if (t.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'nicht', t.tag))
      } else {
        return L.tybool
      }
    }
    case 'plus': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      if (t1.tag !== 'nat') {
        throw new Error(expectedTypeMsg('nat', 1, 'plus', t1.tag))
      } else if (t2.tag !== 'nat') {
        throw new Error(expectedTypeMsg('nat', 2, 'plus', t2.tag))
      }
      return L.tynat
    }
    case 'gleich': {
      const _t1 = typecheck(ctx, e.e1)
      const _t2 = typecheck(ctx, e.e2)
      if (_t1.tag === _t2.tag){
        return L.tybool
      } else {
        throw new Error(expectedTypeMsg(_t1.tag, 1, 'gleich', _t2.tag))
      }
    }
    case 'und': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'und', t1.tag))
      } else if (t2.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 2, 'und', t2.tag))
      }
      return L.tybool
    }
    case 'oder': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'oder', t1.tag))
      } else if (t2.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 2, 'oder', t2.tag))
      }
      return L.tybool
    }
    case 'falls': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      const t3 = typecheck(ctx, e.e3)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'falls', t1.tag))
      } else if (t2.tag !== t3.tag) {
        throw new Error(expectedTypeMsg(t2.tag, 3, 'falls', t3.tag))
      }
      return t3
    }
    default: throw new Error('something is wrong with typechecker')
  }
}

/*
export function checkWF(ctx: L.Ctx, prog: L.Prog) {
  // TODO: implement me!
}
*/

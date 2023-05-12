/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import * as L from './lang'

function expectedTypeMsg (expected: string, pos: number, fn: string, found: string): string {
  return `Type error: Expected ${expected} in position ${pos} of ${fn} but found ${found}`
}

/** @return the type of expression `e` */

export function typecheck (ctx: L.Env, e: L.Exp): L.Value {
  switch (e.tag) {
    case 'var': {
      if (ctx.has(e.value)) {
        return ctx.get(e.value)!
      } else {
        throw new Error(`Type error: unbound variable: ${e.value}`)
      }
    }
    case 'num':
      return e
    case 'bool':
      return e
    case 'lam': {
      const outTy = typecheck(L.extend(e.params, e.body), e.body)
      return L.tyarr([e.body], outTy)
    }
    case 'app': {
      const thead = typecheck(ctx, e.head)
      const targs = e.args.map(arg => typecheck(ctx, arg))
      if (thead.tag !== 'arr') {
        throw new Error(`Type error: expected arrow type but found '${L.prettyValue(thead)}'`)
      } else if (thead.inputs.length !== targs.length) {
        throw new Error(`Type error: expected ${thead.inputs.length} arguments but found ${targs.length}`)
      } else {
        thead.inputs.forEach((t, i) => {
          if (!L.typEquals(t, targs[i])) {
            throw new Error(`Type error: expected ${L.prettyValue(t)} but found ${L.prettyValue(targs[i])}`)
          }
        })
        return thead.output
      }
    }
    case 'ob': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      const t3 = typecheck(ctx, e.e3)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'if', t1.tag))
      } else if (t2.tag !== t3.tag) {
        throw new Error(expectedTypeMsg(t2.tag, 3, 'if', t3.tag))
      }
      return t3
    }
    default:
      console.log(expectedTypeMsg('Type', 0, 'typecheck', 'invalid'))
      return L.num(0)
  }
}

export function checkWF (env: L.Env, prog: L.Prog): void {
  prog.forEach((s) => {
    switch (s.tag) {
      case 'definieren': {
        const t = typecheck(env, s.exp)
        L.extendCtx(s.id, t, env)
        break
      }
      case 'druck': {
        typecheck(env, s.exp)
        break
      }
    }
  })
}

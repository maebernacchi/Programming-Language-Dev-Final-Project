/* eslint-disable @typescript-eslint/consistent-generic-constructors */
/* eslint-disable @typescript-eslint/quotes */
import * as L from './lang'

/** The output of our programs: a list of strings that our program printed. */
export type Output = string[]

/** @returns the value that expression `e` evaluates to. */
export function evaluate (env: L.Env, e: L.Exp): L.Value {
  switch (e.tag) {
    case 'var': {
      if (env.has(e.value)) {
        return env.get(e.value)
      } else {
        throw new Error(`Runtime error: unbound variable '${e.value}'`)
      }
    }
    case 'num':
      return e
    case 'bool':
      return e
    case 'lam':
      return L.closure(e.params, e.body, env)
    case 'app': {
      const head = evaluate(env, e.head)
      const args = e.args.map(arg => evaluate(env, arg))
      if (head.tag === 'closure') {
        if (args.length !== head.params.length) {
          throw new Error(`Runtime error: expected ${head.params.length} arguments, but found ${args.length}`)
        } else {
          return evaluate(head.env.extend(head.params, args), head.body)
        }
      } else if (head.tag === 'prim') {
        return head.fn(args)
      } else if (head.tag === 'object') {
        if (args.length % 2 !== 0) {
          throw new Error(`Runtime error: fuck you, can't count (interpreter.ts line 34)`)
        }
        const ret: Map<string, L.Value> = new Map([])
        for (let i = 0; i < args.length; i += 2) {
          const e1 = args[i]
          const e2 = args[i + 1]
          if (e1.tag !== 'keyword') {
            throw new Error(`Runtime error: left side of pairs in obj must be keywords`)
          } else {
            ret.set(e1.value, e2)
          }
        }
        return L.vobject(L.nole, ret)
      } else {
        throw new Error(`Runtime error: expected closure or primitive or obj, but found '${L.prettyExp(head)}'`)
      }
    }
    case 'if': {
      const v = evaluate(env, e.e1)
      if (v.tag === 'bool') {
        return v.value ? evaluate(env, e.e2) : evaluate(env, e.e3)
      } else {
        throw new Error(`Type error: 'if' expects a boolean in guard position but a ${v.tag} was given.`)
      }
    }
    case 'null': {
      return e
    }
    case 'keyword': {
      return e
    }
    case 'valwrap': {
      return e.value
    }
  }
}

/** @returns the result of executing program `prog` under environment `env` */
export function execute (env: L.Env, prog: L.Prog): Output {
  const output: Output = []
  for (const s of prog) {
    switch (s.tag) {
      case 'define': {
        const v = evaluate(env, s.exp)
        env.set(s.id, v)
        break
      }
      case 'print': {
        const v = evaluate(env, s.exp)
        output.push(L.prettyValue(v))
        break
      }
    }
  }
  return output
}

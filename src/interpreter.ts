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
        throw new Error(`Laufzeit Fehler: ungebunden Variable '${e.value}'`)
      }
    }
    case 'num':
      return e
    case 'bool':
      return e
    case 'lam':
      return L.schluss(e.params, e.body, env)
    case 'app': {
      const head = evaluate(env, e.head)
      const args = e.args.map(arg => evaluate(env, arg))
      if (head.tag === 'schluss') {
        if (args.length !== head.params.length) {
          throw new Error(`Laufzeit Fehler: erwartet ${head.params.length} Auseinandersetzungen, aber gat ${args.length} gefunden`)
        } else {
          return evaluate(head.env.extend(head.params, args), head.body)
        }
      } else if (head.tag === 'prim') {
        return head.fn(args)
      } else if (head.tag === 'objekt') {
        if (args.length % 2 !== 0) {
          throw new Error(`Laufzeit Fehler: es gibt nicht genug Auseinandersetzungen (interpreter.ts Linie 34)`)
        }
        const ret: Map<string, L.Value> = new Map([])
        for (let i = 0; i < args.length; i += 2) {
          const e1 = args[i]
          const e2 = args[i + 1]
          if (e1.tag !== 'schlüssel') {
            throw new Error(`Laufzeit Fehler: linkse Seite von Paare in Objekt müsst Schlüssel sind.`)
          } else {
            ret.set(e1.value, e2)
          }
        }
        return L.vobjekt(L.nichts, ret)
      } else {
        throw new Error(`Laufzeit Fehler: geschätzt Schluss, Primitive oder Objekt, aber hat '${L.prettyExp(head)}' gefunden`)
      }
    }
    case 'ob': {
      const v = evaluate(env, e.e1)
      if (v.tag === 'bool') {
        return v.value ? evaluate(env, e.e2) : evaluate(env, e.e3)
      } else {
        throw new Error(`Typ fehler: 'ob' erwartet ein Boolean in Schutzlage aber ein ${v.tag} war gegeben.`)
      }
    }
    case 'null': {
      return e
    }
    case 'schlüssel': {
      return e
    }
    case 'wertwick': {
      return e.value
    }
  }
}

/** @returns the result of executing program `prog` under environment `env` */
export function execute (env: L.Env, prog: L.Prog): Output {
  const output: Output = []
  for (const s of prog) {
    switch (s.tag) {
      case 'definieren': {
        const v = evaluate(env, s.exp)
        env.set(s.id, v)
        break
      }
      case 'druck': {
        const v = evaluate(env, s.exp)
        output.push(L.prettyValue(v))
        break
      }
    }
  }
  return output
}

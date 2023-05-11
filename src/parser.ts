import * as S from './sexp'
import * as L from './lang'

/** @returns the expression parsed from the given s-expression. */
export function translateExp (e: S.Sexp): L.Exp {
  if (e.tag === 'atom') {
    if (e.value === 'richtig') {
      return L.bool(true)
    } else if (e.value === 'falsch') {
      return L.bool(false)
    } else if (/\d+$/.test(e.value)) {
      return L.num(parseInt(e.value))
    } else if (e.value === 'null') {
      return L.nichts
    } else { // otherwise it is variable or keyword
      return (e.value[0] === ':') ? L.keyword(e.value) : L.evar(e.value)
    }
  } else if (e.exps.length === 0) {
    throw new Error('Parse Fehler: leere Ausdruck-Liste traf')
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag === 'atom' && head.value === 'lambda') {
      if (args.length === 0) {
        throw new Error(`Parse fehler: 'lambda' erwartet wenigstens 1 Argument aber ${args.length} war gegeben`)
      }
      const params = args.slice(0, args.length - 1)
      const body = args[args.length - 1]
      for (const p of params) {
        if (p.tag !== 'atom') {
          throw new Error(`Parse fehler: 'lambda' erwartet die Argumente sind  Identifikatoren aber ${S.sexpToString(p)} war gegeben`)
        }
      }
      return L.lam(params.map(p => (p as S.Atom).value), translateExp(body))
    } else if (head.tag === 'atom' && head.value === 'ob') {
      if (args.length !== 3) {
        throw new Error(`Parse fehler: 'ob' erwartet 3 Argumente aber ${args.length} war gegeben`)
      } else {
        return L.obs(translateExp(args[0]), translateExp(args[1]), translateExp(args[2]))
      }
    } else {
      return L.app(translateExp(head), args.map(translateExp))
    }
  }
}

export function translateStmt (e: S.Sexp): L.Stmt {
  if (e.tag === 'atom') {
    throw new Error(`Parse Fehler: ein atom kann nicht ein Aussagen sind: '${e.value}'`)
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag !== 'atom') {
      throw new Error('Parse Fehler: Identifikator erwartet am kopf von Betreiber/Form')
    } else if (head.value === 'definieren') {
      if (args.length !== 2) {
        throw new Error(`Parse Fehler: 'definieren' erwartet 2 Argumente aber ${args.length} war gegeben`)
      } else if (args[0].tag !== 'atom') {
        throw new Error("Parse Fehler: 'definieren' erwartet die erste Argument ein Identifikator ist.")
      } else {
        return L.sdefinieren(args[0].value, translateExp(args[1]))
      }
    } else if (head.value === 'druck') {
      if (args.length !== 1) {
        throw new Error(`Parse fehler: 'druck' erwartet 1 Argument aber ${args.length} war gegeben`)
      } else {
        return L.sprint(translateExp(args[0]))
      }
    } else {
      throw new Error(`Parse fehler: unbekenntnisse Aussage-Form '${S.sexpToString(e)}'`)
    }
  }
}

export function translateProg (es: S.Sexp[]): L.Prog {
  return es.map(translateStmt)
}

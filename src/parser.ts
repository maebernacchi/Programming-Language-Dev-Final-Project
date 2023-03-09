import * as L from './lang'
import * as Lex from './lexer'

type ParserState = {
  index: number
}

export function mkInitialState(): ParserState {
  return { index: 0 }
}

/** @return `f` but as a function that takes an array instead of 1 argument */
function wrap1<T> (f: (_x: T) => T): (args: T[]) => T {
  return (args) => f(args[0])
}

/** @return `f` but as a function that takes an array instead of 2 arguments */
function wrap2<T> (f: (_x1: T, _x2: T) => T): (args: T[]) => T {
  return (args) => f(args[0], args[1])
}

/** @return `f` but as a function that takes an array instead of 3 arguments */
function wrap3<T> (f: (_x1: T, _x2: T, _x3: T) => T): (args: T[]) => T {
  return (args) => f(args[0], args[1], args[2])
}

/** A mapping from function symbols to AST constructors for those functions */
const functionMap: Map<string, (args: L.Exp[]) => L.Exp> =
  new Map([
    ['nicht', wrap1(L.nicht)],
    ['+', wrap2(L.plus)],
    ['=', wrap2(L.gleich)],
    ['und', wrap2(L.und)],
    ['sonst', wrap2(L.sonst)],
    ['ob', wrap3(L.ob)]
  ])

function chomp(state: ParserState, toks: Lex.Tok[], tag: string): void {
  if (toks[state.index].tag === tag) {
    state.index += 1
  } else {
    throw new Error(`Parser Felher: geschätzt '${tag}', wir haben '${toks[state.index].tag} gefunden'`)
  }
}

function parseExp(state: ParserState, toks: Lex.Tok[]): L.Exp {
  if (state.index >= toks.length) {
    throw new Error('Parser Felher: unerwartet Ende von Einsatz')
  }
  const tok = toks[state.index]
  if (tok.tag === 'true') {
    state.index += 1
    return L.bool(true)
  } else if (tok.tag === 'false') {
    state.index += 1
    return L.bool(false)
  } else if (tok.tag === 'num') {
    state.index += 1
    return L.zahl(tok.value)
  } else if (tok.tag === '(') {
    chomp(state, toks, '(')
    const head = toks[state.index++]
    if (head.tag !== 'ident') {
      throw new Error(`Parser Felher: Kopf von Anwendung ist nicht eine Identifikator: '${Lex.prettyTok(head)}'`)
    } else {
      const id = head.value
      const exps = []
      while (toks[state.index].tag !== ')') {
        exps.push(parseExp(state, toks))
      }
      chomp(state, toks, ')')
      if (functionMap.has(id)) {
        return functionMap.get(id)!(exps)
      } else {
        throw new Error(`Parser Felher: verkannt Form '${id}'`)
      }
    }
  } else {
    throw new Error(`Parser Felher: unerwartete Zeichen: '${Lex.prettyTok(tok)}'`)
  }
}

export function parse(src: string): L.Exp {
  return parseExp(mkInitialState(), Lex.lex(src))
}

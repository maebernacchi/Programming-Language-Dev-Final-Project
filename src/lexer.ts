/**
* This code was taken from Lab 4 from CSC-312. I will make edits when given the chance
This is sexp 
*/

/***** Lexer Datatypes ********************************************************/

export type LexerState = {
  index: number
}

export type TNum = { tag: 'num', value: number }
const tnum = (value: number): Tok => ({ tag: 'num', value })

export type TIdent = { tag: 'ident', value: string }
const tident = (value: string): Tok => ({ tag: 'ident', value })

export type TLParen = { tag: '(' }
const tlparen: Tok = ({ tag: '(' })

export type TRParen = { tag: ')' }
const trparen: Tok = ({ tag: ')' })

export type TTrue = { tag: 'true' }
const ttrue: Tok = ({ tag: 'true' })

export type TFalse = { tag: 'false' }
const tfalse: Tok = ({ tag: 'false' })

/** The type of tokens generated by the lexer. */
export type Tok = TNum | TIdent | TLParen | TRParen | TTrue | TFalse 

/***** Lexer Function *********************************************************/

/**
 * @returns a pretty version of the input token `tok`.
 */
export function prettyTok(tok: Tok): string {
  switch (tok.tag) {
    case 'num': return tok.value.toString()
    case 'ident': return tok.value
    case '(': return '('
    case ')': return ')'
    case 'true': return 'true'
    case 'false': return 'false'
  }
}

function tokenize(state: LexerState, src: string): Tok[] {
  const ret: Tok[] = []
  while (state.index < src.length) {
    // Skip over whitespace
    while (/\s/.test(src[state.index])) { state.index += 1 }
   
    const leader = src[state.index]
    if (leader === '(') {
      state.index += 1
      ret.push(tlparen)
    } else if (leader === ')') {
      state.index += 1
      ret.push(trparen)
    } else if (/\d/.test(leader)) {
      let digits = leader
      while (/\d/.test(src[++state.index])) {
        digits += src[state.index]
      }
      ret.push(tnum(parseInt(digits)))
    } else {
      // N.B., identifiers are tokens that do not start with a digit.
      let chk = leader
      let cur = src[++state.index]
      while (state.index < src.length && /\S/.test(cur) && cur !== '(' && cur !== ')') {
        chk += cur
        cur = src[++state.index]
      }
      if (chk === 'true') {
        ret.push(ttrue)
      } else if (chk === 'false') {
        ret.push(tfalse)
      } else {
        ret.push(tident(chk))
      }
    }
  }
  return ret
}

/**
 * @returns an array of tokens created by lexing `src`.
 */
export function lex(src: string): Tok[] {
  return tokenize({ index: 0 }, src)
}

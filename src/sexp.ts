/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/prefer-readonly */
/** A `Tok` is a semantically meaningful chunk of text. */
export type Tok = string

/** A `Lexer` statefully transforms an input string into a list of tokens. */
export class Lexer {
  private pos: number
  private src: string

  /** Constructs a new `Lexer` from the given `src` string. */
  constructor (src: string) {
    this.pos = 0
    this.src = src
  }

  /** @returns true if the lexer has exhausted its input. */
  empty (): boolean {
    return this.pos >= this.src.length
  }

  /** @returns the next character of the input. */
  private peek (): string {
    if (this.empty()) {
      throw new Error('Lexer Fehler: unerwartet Ende von Eingabe als lexing.')
    } else {
      return this.src[this.pos]
    }
  }

  /** Advances the tokenizer forward one character. */
  private advance (): void { this.pos += 1 }

  /** @return the next `Tok` from this lexer's source string. */
  private lex1 (): Tok {
    const leader = this.peek()
    if (leader === '(') {
      this.advance()
      return '('
    } else if (leader === ')') {
      this.advance()
      return ')'
    } else {
      // N.B., identifiers are non-parentheses chunks of text
      let chk = ''
      let cur = leader
      while (/\S/.test(cur) && cur !== '(' && cur !== ')') {
        chk += cur
        this.advance()
        if (this.empty()) break
        cur = this.peek()
      }
      return chk
    }
  }

  /**
   * Consumes leading whitespace in the input up until the next non-whitespace
   * character.
   */
  whitespace (): void {
    while (!this.empty() && /\s/.test(this.peek())) { this.advance() }
  }

  /** @returns a list of tokens lexed from this lexer's source string. */
  tokenize (): Tok[] {
    const ret: Tok[] = []
    this.whitespace()
    while (!this.empty()) {
      ret.push(this.lex1())
      this.whitespace()
    }
    return ret
  }
}

/***** S-expression Datatypes *************************************************/

/** An `Atom` is a non-delineating chunk of text. */
export type Atom = { tag: 'atom', value: string }
const atom = (value: string): Sexp => ({ tag: 'atom', value })

/** A `SList` is a list of s-expressions. */
export type SList = { tag: 'slist', exps: Sexp [] }
const slist = (exps: Sexp[]): Sexp => ({ tag: 'slist', exps })

/** An s-expression is either an `Atom` or a list of s-expressions, a `SList`. */
export type Sexp = Atom | SList

/** @returns a string representation of `Sexp` `e`. */
export function sexpToString (e: Sexp): string {
  if (e.tag === 'atom') {
    return e.value
  } else {
    return `(${e.exps.map(sexpToString).join(' ')})`
  }
}

/***** S-expression Parsing ***************************************************/

/**
 * A `Parser` statefully transforms a list of tokens into a s-expression
 * or a collection of s-expressions.
 */
class Parser {
  private pos: number
  private toks: Tok[]

  constructor (toks: Tok[]) {
    this.pos = 0
    this.toks = toks
  }

  /** @returns true if the parser has exhausted its input. */
  empty (): boolean {
    return this.pos >= this.toks.length
  }

  /** @returns the next token of the input. */
  peek (): string {
    if (this.empty()) {
      throw new Error('Parser error: unerwartet Ende von Eingabe als parsing.')
    } else {
      return this.toks[this.pos]
    }
  }

  /** Advances the parser one token forward. */
  advance (): void { this.pos += 1 }

  /** @returns the next `Sexp` parsed from the input. */
  parse1 (): Sexp {
    const head = this.peek()
    if (head === '(') {
      // N.B., move past the '('
      this.advance()
      if (this.empty()) {
        throw new Error('Parser Fehler: unerwartet Ende von Eingabe als parsing.')
      }
      const ret: Sexp[] = []
      while (this.peek() !== ')') {
        ret.push(this.parse1())
      }
      // N.B., move past the ')'
      this.advance()
      return slist(ret)
    } else if (head === ')') {
      throw new Error('Parser Fehler: unerwartete vertraut parentheses begegnet.')
    } else {
      // N.B., move past the head
      this.advance()
      return atom(head)
    }
  }

  /** @return the collection of `Sexp`s parsed from the input. */
  parse (): Sexp[] {
    const ret: Sexp[] = []
    while (!this.empty()) {
      ret.push(this.parse1())
    }
    return ret
  }
}

/** @returns a single sexp */
export function parse1 (src: string): Sexp {
  const parser = new Parser(new Lexer(src).tokenize())
  const result = parser.parse1()
  if (parser.empty()) {
    return result
  } else {
    throw new Error(`Parse Felher: input nicht total konsumiert: '${parser.peek()}'`)
  }
}

/** @returns a list of Sexps parsed from the input source string. */
export function parse (src: string): Sexp[] {
  const parser = new Parser(new Lexer(src).tokenize())
  const result = parser.parse()
  if (parser.empty()) {
    return result
  } else {
    throw new Error(`Parse Felher: input nicht total konsumiert: '${parser.peek()}'`)
  }
}

import { describe, expect, test } from '@jest/globals'
import * as S from '../src/sexp'
import * as T from '../src/translator'
import * as L from '../src/lang'
import * as E from '../src/runtime'

const pangram = `
  (if (and true false) 1 (if (or (= 11 50) (= 672 672)) (not (= (+ 35 (+ 1 1)) 37)) (= 1 1)))
`.trim()

const totallyenviro: L.Env = 
  new Map([
  ])

describe('Lexer and Parser', () => {
  test('single number', () => {
    expect(T.translateExp(S.parse1('1'))).toStrictEqual(L.num(1))
  })
  test('pangram (pretty)', () => {
    expect(L.prettyExp(T.translateExp(S.parse1(pangram)))).toStrictEqual(pangram)
  })
  test('pangram (eval)', () => {
    expect(E.evaluate(T.translateExp(S.parse1(pangram)), totallyenviro)).toStrictEqual(L.bool(false))
  })
})


describe('execution', () => {
  test('"print" number', () => {
    expect(E.execute(totallyenviro, [L.sdruck(L.num(3))])).toStrictEqual(['3'])
  })
  test('define x = 5', () => {
    expect(E.execute(totallyenviro, [L.sdefinieren('x', L.num(5))])).toStrictEqual([])
  })
  test('define and print y = 7', () => {
    expect(E.execute(totallyenviro, [L.sdefinieren('y', L.num(7)), L.sdruck(L.evar('y'))])).toStrictEqual(['7'])
  })
})

describe('base lambda', () => {
  test('prettyExp', () => {
    expect(L.prettyExp(L.slambda('x', L.tynat, L.evar('x')))).toStrictEqual('(lambda (x nat) x)')
  })
  test('evaluate', () => {
    expect(E.evaluate(L.slambda('z', L.tybool, L.evar('z')), totallyenviro))
      .toStrictEqual(L.slambda('z', L.tybool, L.evar('z')))
  })
})

const ex1: L.Exp = L.gleich(L.num(5), L.plus(L.evar('x'), L.num(1)))
const ex2: L.Exp = L.gleich(L.num(5), L.plus(L.num(3), L.num(1)))

describe('substitute', () => {
  test('base case (app (lambda (x bool) (not x)), true)', () => {
    expect(L.substitute(L.num(3), 'x', ex1)).toStrictEqual(ex2)
  })
})

const ex5: L.Stmt = L.sdefinieren('x', L.num(1))
const ex6: L.Exp = L.evar('x')
const ex7: L.Stmt = L.sdefinieren('y', L.num(5))
const ex8: L.Exp = L.evar('y')

describe('globals testing', () => {
  test('Global value retention', () => {
    // so even after ex3 changes x to be 3, printing x again outside the lambda
    // still has x value of 1.
    expect(E.execute(totallyenviro, [ex5, L.sdruck(ex6), L.sdruck(ex6)]))
      .toStrictEqual(['1', 'true', '1'])
  })
  test('Additional Global Value Retention', () => {
    expect(E.execute(totallyenviro, [ex7, L.sdruck(ex8), L.sdruck(ex8)]))
    .toStrictEqual(['5', 'true', '5'])
  })
})
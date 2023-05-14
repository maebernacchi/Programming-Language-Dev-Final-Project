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
    expect(E.execute(totallyenviro, [L.sprint(L.num(3))])).toStrictEqual(['3'])
  })
  test('define x = 5', () => {
    expect(E.execute(totallyenviro, [L.sdefine('x', L.num(5))])).toStrictEqual([])
  })
  test('define and print y = 7', () => {
    expect(E.execute(totallyenviro, [L.sdefine('y', L.num(7)), L.sprint(L.evar('y'))])).toStrictEqual(['7'])
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

describe('app', () => {
  test('prettyExp', () => {
    expect(L.prettyExp(appEx1)).toStrictEqual('((lambda (x bool) (not x)) true)')
  })
  test('evaluate', () => {
    expect(E.evaluate(appEx1, totallyenviro)).toStrictEqual(L.bool(false))
  })
})

const ex1: L.Exp = L.eq(L.num(5), L.plus(L.evar('x'), L.num(1)))
const ex2: L.Exp = L.eq(L.num(5), L.plus(L.num(3), L.num(1)))

describe('substitute', () => {
  test('base case (app (lambda (x bool) (not x)), true)', () => {
    expect(L.substitute(L.num(3), 'x', ex1)).toStrictEqual(ex2)
  })
})

// more complex testing
// ex3 = (app (lambda (x nat) (eq x 3)), 3)  - returns true
const ex3: L.Exp = L.app(L.slambda('x', L.tynat, L.eq(L.evar('x'), L.num(3))), L.num(3))
// ex4 = (app (lambda (x bool) (and x true)), ex3) - returns true
const ex4: L.Exp = L.app(L.slambda('x', L.tybool, L.and(L.evar('x'), L.bool(true))), ex3)

describe('complex testing', () => {
  test('basic app with nat', () => {
    expect(E.evaluate(ex3, totallyenviro)).toStrictEqual(L.bool(true))
  })
  test('nested lambda', () => {
    expect(E.evaluate(ex4, totallyenviro)).toStrictEqual(L.bool(true))
  })
  test('Another app with nat', () => {
    expect(E.evaluate(ex4, totallyenviro)).toStrictEqual(L.bool(true))
  })
  test('Additional nested Lambda', () => {
    expect(E.evaluate(ex3, totallyenviro)).toStrictEqual(L.bool(true))
  })
})

const ex5: L.Stmt = L.sdefine('x', L.num(1))
const ex6: L.Exp = L.evar('x')
const ex7: L.Stmt = L.sdefine('y', L.num(5))
const ex8: L.Exp = L.evar('y')

describe('globals testing', () => {
  test('Global value retention', () => {
    // so even after ex3 changes x to be 3, printing x again outside the lambda
    // still has x value of 1.
    expect(E.execute(totallyenviro, [ex5, L.sprint(ex6), L.sprint(ex3), L.sprint(ex6)]))
      .toStrictEqual(['1', 'true', '1'])
  })
  test('Additional Global Value Retention', () => {
    expect(E.execute(totallyenviro, [ex7, L.sprint(ex8), L.sprint(ex3), L.sprint(ex8)]))
    .toStrictEqual(['5', 'true', '5'])
  })
})
import { describe, expect, test } from '@jest/globals'
import * as S from '../src/sexp'
import * as T from '../src/translator'
import * as L from '../src/lang'
import * as E from '../src/runtime'

const pangram = `
  (falls (und richtig falsch) 1 (falls (oder (= 11 50) (= 672 672)) (nicht (= (+ 35 (+ 1 1)) 37)) (= 1 1)))
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

import { describe, expect, test } from '@jest/globals'

describe('Initial testing of expressions', () => {
  test('basic addition', () => {
    expect(1 + 1).toStrictEqual(2)
  })
  test('basic subtraction', () => {
    expect(1 - 1).toStrictEqual(0)
  })
  test('basic multiplication', () => {
    expect(1 * 2).toStrictEqual(2)
  })
  test('basic division', () => {
    expect(10 / 2).toStrictEqual(5)
  })
})


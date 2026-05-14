import { Integer, Minus, namedConstants, Variable } from '../core'

import { Expression } from './Expression'

// Integer constants.
export const minusOne = new Expression(new Minus(Integer.one))
export const zero = new Expression(Integer.zero)
export const one = new Expression(Integer.one)
export const two = new Expression(Integer.two)
export const three = new Expression(Integer.three)
export const four = new Expression(Integer.four)
export const five = new Expression(Integer.five)
export const six = new Expression(Integer.six)
export const seven = new Expression(Integer.seven)
export const eight = new Expression(Integer.eight)
export const nine = new Expression(Integer.nine)
export const ten = new Expression(Integer.ten)
export const eleven = new Expression(Integer.eleven)
export const twelve = new Expression(Integer.twelve)
export const twenty = new Expression(Integer.twenty)
export const hundred = new Expression(Integer.hundred)

// Named constants.
export const e = new Expression(namedConstants.e)
export const pi = new Expression(namedConstants.pi)
export const infinity = new Expression(namedConstants.infinity)

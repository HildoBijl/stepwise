import type { EquationInputValue, ExpressionInputValue } from './InputValue.ts'

// Define cursors for the various construct types.
export type TextPartCursor = number
export type FractionCursor = { part: 'numerator' | 'denominator', cursor: ExpressionCursor }
export type SquareRootCursor = { part: 'radicand', cursor: ExpressionCursor }
export type RootCursor = { part: 'degree' | 'radicand', cursor: ExpressionCursor }
export type LogarithmCursor = { part: 'base', cursor: ExpressionCursor }
export type SubSupCursor = { part: 'subscript', cursor: number } | { part: 'superscript', cursor: ExpressionCursor }

// A recursive cursor starts by selecting a part in an expression array, then describes its position within that text part or construct.
export type InputValuePartCursor = TextPartCursor | FractionCursor | SquareRootCursor | RootCursor | LogarithmCursor | SubSupCursor
export type ExpressionCursor = { part: number, cursor: InputValuePartCursor }

// A non-recursive cursor pointing into a text part of an expression array. Parsing and manipulation utilities use this to mark expression boundaries.
export type ExpressionTextCursor = { part: number, cursor: TextPartCursor }

// Add a cursor to the input value to get an input state.
export type ExpressionInputState = ExpressionInputValue & { cursor: ExpressionCursor }
export type EquationInputState = EquationInputValue & { cursor: ExpressionCursor }
export type InputState = ExpressionInputState | EquationInputState

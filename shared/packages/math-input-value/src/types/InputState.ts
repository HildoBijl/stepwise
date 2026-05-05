import { ExpressionInputValue } from './InputValue'

// Add cursors to turn into InputState.
export type InputCursorEnd = { part: number, cursor: number }
export type InputCursor = InputCursorEnd | { part: number, cursor: InputCursor }
export type ExpressionInputState = ExpressionInputValue & { cursor: InputCursor }
export type InputState = ExpressionInputState // ToDo: Add equation?

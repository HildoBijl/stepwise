import type { InterpretationSettingsInput, ExpressionSettingsInput } from '../settings'

// The parts of an expression InputValue.
export type ExpressionPartInputValue = { type: 'ExpressionPart', value: string }
export type AccentInputValue = { type: 'Accent', name: string, alias?: string, value: string }
export type SubscriptTextInputValue = { type: 'SubscriptText', value: string }
export type SubSupInputValue = { type: 'Function', name: 'subSup', value: [SubscriptTextInputValue?, ExpressionInputValue?], alias?: string } // ToDo: adjust to not have "type Function, name subSup" but instantly have "type subSup"?
export type FunctionInputValue = { type: 'Function', name: string, value: ExpressionInputValue[], alias?: string }
export type InputValuePart = ExpressionPartInputValue | AccentInputValue | SubSupInputValue | FunctionInputValue

// Combine with settings to get InputValues for expressions and similar.
type MathInputValueBase = { value: InputValuePart[], interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput }
export type ExpressionInputValue = { type: 'Expression' } & MathInputValueBase
export type EquationInputValue = { type: 'Equation' } & MathInputValueBase
export type InputValue = ExpressionInputValue | EquationInputValue

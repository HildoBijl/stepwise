import type { InterpretationSettings, ExpressionSettings } from '../settings'

// The parts of an expression InputValue.
export type ExpressionPartInputValue = { type: 'ExpressionPart', value: string }
export type AccentInputValue = { type: 'Accent', name: string, alias?: string, value: string }
export type SubscriptTextInputValue = { type: 'SubscriptText', value: string }
export type SubSupInputValue = { type: 'Function', name: 'subSup', value: [SubscriptTextInputValue?, ExpressionInputValue?], alias?: string }
export type FunctionInputValue = { type: 'Function', name: string, value: ExpressionInputValue[], alias?: string }
export type InputValuePart = ExpressionPartInputValue | AccentInputValue | SubSupInputValue | FunctionInputValue

// Combine with settings to get InputValues for expressions and similar.
export type ExpressionInputValue = { type: 'Expression', value: InputValuePart[], interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings> }
export type InputValue = ExpressionInputValue // ToDo: Add equation?

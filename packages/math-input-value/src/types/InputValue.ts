import type { InterpretationSettingsOptions, ExpressionSettingsOptions } from '../settings/index.ts'
import type { AccentName } from '../definitions/accents.ts'

export type ExpressionValue = InputValuePart[]

export type SubSupInputValue = { type: 'SubSup', subscript?: string, superscript?: ExpressionValue }
export type FractionInputValue = { type: 'Fraction', alias?: string, numerator: ExpressionValue, denominator: ExpressionValue }
export type SquareRootInputValue = { type: 'SquareRoot', alias?: string, radicand: ExpressionValue }
export type RootInputValue = { type: 'Root', alias?: string, degree: ExpressionValue, radicand: ExpressionValue }
export type LogarithmInputValue = { type: 'Logarithm', alias?: string, base: ExpressionValue }

export type ConstructInputValue = FractionInputValue | SquareRootInputValue | RootInputValue | LogarithmInputValue | SubSupInputValue
export type AccentInputValue = { type: 'Accent', name: AccentName, alias?: string, value: string }
export type InputValuePart = string | ConstructInputValue | AccentInputValue

type MathInputValueBase = { value: ExpressionValue, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions }
export type ExpressionInputValue = { type: 'Expression' } & MathInputValueBase
export type EquationInputValue = { type: 'Equation' } & MathInputValueBase
export type InputValue = ExpressionInputValue | EquationInputValue

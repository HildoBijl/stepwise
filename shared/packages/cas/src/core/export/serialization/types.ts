import { type AccentName } from '@step-wise/math-input-value'

import { type NamedConstantSymbol } from '../../construction'

// Constants
export type IntegerStorageValue = { subtype: 'Integer', value: number }
export type FloatStorageValue = { subtype: 'Float', value: number }
export type NamedConstantStorageValue = { subtype: 'NamedConstant', symbol: NamedConstantSymbol }
export type ConstantNodeStorageValue = IntegerStorageValue | FloatStorageValue | NamedConstantStorageValue

// Signs
export type MinusStorageValue = { subtype: 'Minus', node: ExpressionNodeStorageValue }
export type PlusMinusStorageValue = { subtype: 'PlusMinus', node: ExpressionNodeStorageValue }
export type SignNodeStorageValue = MinusStorageValue | PlusMinusStorageValue

// Variables
export type VariableStorageValue = { subtype: 'Variable', symbol: string, subscript?: string, accent?: AccentName }

// Lists
export type BaseListNodeStorageValue = { terms: ExpressionNodeStorageValue[] }
export type SumStorageValue = BaseListNodeStorageValue & { subtype: 'Sum' }
export type ProductStorageValue = BaseListNodeStorageValue & { subtype: 'Product' }
export type ListNodeStorageValue = SumStorageValue | ProductStorageValue

// Functions
export type PowerStorageValue = { subtype: 'Power', base: ExpressionNodeStorageValue, exponent: ExpressionNodeStorageValue }
export type FractionStorageValue = { subtype: 'Fraction', numerator: ExpressionNodeStorageValue, denominator: ExpressionNodeStorageValue }
export type SqrtStorageValue = { subtype: 'Sqrt', argument: ExpressionNodeStorageValue }
export type RootStorageValue = { subtype: 'Root', argument: ExpressionNodeStorageValue, base: ExpressionNodeStorageValue }
export type LnStorageValue = { subtype: 'Ln', argument: ExpressionNodeStorageValue }
export type LogStorageValue = { subtype: 'Log', argument: ExpressionNodeStorageValue, base: ExpressionNodeStorageValue }
export type FunctionNodeStorageValue = PowerStorageValue | FractionStorageValue | SqrtStorageValue | RootStorageValue | LnStorageValue | LogStorageValue

// Trigonometry
export type SinStorageValue = { subtype: 'Sin', argument: ExpressionNodeStorageValue }
export type CosStorageValue = { subtype: 'Cos', argument: ExpressionNodeStorageValue }
export type TanStorageValue = { subtype: 'Tan', argument: ExpressionNodeStorageValue }
export type ArcsinStorageValue = { subtype: 'Arcsin', argument: ExpressionNodeStorageValue }
export type ArccosStorageValue = { subtype: 'Arccos', argument: ExpressionNodeStorageValue }
export type ArctanStorageValue = { subtype: 'Arctan', argument: ExpressionNodeStorageValue }
export type TrigonometryFunctionStorageValue = SinStorageValue | CosStorageValue | TanStorageValue | ArcsinStorageValue | ArccosStorageValue | ArctanStorageValue

// Merge into a general Node type
export type ExpressionNodeStorageValue = ConstantNodeStorageValue | SignNodeStorageValue | VariableStorageValue | ListNodeStorageValue | FunctionNodeStorageValue | TrigonometryFunctionStorageValue

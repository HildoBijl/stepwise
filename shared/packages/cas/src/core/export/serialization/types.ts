// Constants.
export type BaseConstantNodeStorageValue = { value: number }
export type IntegerStorageValue = BaseConstantNodeStorageValue & { subtype: 'Integer' }
export type FloatStorageValue = BaseConstantNodeStorageValue & { subtype: 'Float' }
export type ConstantNodeStorageValue = IntegerStorageValue | FloatStorageValue
export type SignStorageValue = { subtype: 'Sign', node: ExpressionNodeStorageValue, negative?: true, plusMinus?: true }

// Variables.
export type VariableStorageValue = { subtype: 'Variable', symbol: string, subscript?: string, accent?: string }

// Expression lists.
export type BaseListNodeStorageValue = { terms: ExpressionNodeStorageValue[] }
export type SumStorageValue = BaseListNodeStorageValue & { subtype: 'Sum' }
export type ProductStorageValue = BaseListNodeStorageValue & { subtype: 'Product' }
export type ListNodeStorageValue = SumStorageValue | ProductStorageValue

// Functions.
export type PowerStorageValue = { subtype: 'Power', base: ExpressionNodeStorageValue, exponent: ExpressionNodeStorageValue }
export type FractionStorageValue = { subtype: 'Fraction', numerator: ExpressionNodeStorageValue, denominator: ExpressionNodeStorageValue }
export type SqrtStorageValue = { subtype: 'Sqrt', argument: ExpressionNodeStorageValue }
export type RootStorageValue = { subtype: 'Root', argument: ExpressionNodeStorageValue, base: ExpressionNodeStorageValue }
export type LnStorageValue = { subtype: 'Ln', argument: ExpressionNodeStorageValue }
export type LogStorageValue = { subtype: 'Log', argument: ExpressionNodeStorageValue, base: ExpressionNodeStorageValue }
export type FunctionNodeStorageValue = PowerStorageValue | FractionStorageValue | SqrtStorageValue | RootStorageValue | LnStorageValue | LogStorageValue

// Trigonometry.
export type SinStorageValue = { subtype: 'Sin', argument: ExpressionNodeStorageValue }
export type CosStorageValue = { subtype: 'Cos', argument: ExpressionNodeStorageValue }
export type TanStorageValue = { subtype: 'Tan', argument: ExpressionNodeStorageValue }
export type ArcsinStorageValue = { subtype: 'Arcsin', argument: ExpressionNodeStorageValue }
export type ArccosStorageValue = { subtype: 'Arccos', argument: ExpressionNodeStorageValue }
export type ArctanStorageValue = { subtype: 'Arctan', argument: ExpressionNodeStorageValue }
export type TrigonometryFunctionStorageValue = SinStorageValue | CosStorageValue | TanStorageValue | ArcsinStorageValue | ArccosStorageValue | ArctanStorageValue

// Merge into a general Node type.
export type ExpressionNodeStorageValue = ConstantNodeStorageValue | SignStorageValue | VariableStorageValue | ListNodeStorageValue | FunctionNodeStorageValue | TrigonometryFunctionStorageValue

// Constants.
export type BaseConstantStorageValue = { value: number }
export type IntegerStorageValue = BaseConstantStorageValue & { subtype: 'Integer' }
export type FloatStorageValue = BaseConstantStorageValue & { subtype: 'Float' }
export type PlusMinusStorageValue = { subtype: 'PlusMinus' }
export type ConstantStorageValue = IntegerStorageValue | FloatStorageValue | PlusMinusStorageValue

// Variables.
export type VariableStorageValue = {
	subtype: 'Variable'
	symbol: string
	subscript?: string
	accent?: string
}

// Expression lists.
export type BaseExpressionListStorageValue = { terms: ExpressionNodeStorageValue[] }

export type SumStorageValue = BaseExpressionListStorageValue & { subtype: 'Sum' }
export type ProductStorageValue = BaseExpressionListStorageValue & { subtype: 'Product' }
export type ExpressionListStorageValue = SumStorageValue | ProductStorageValue

// Functions.
export type PowerStorageValue = { subtype: 'Power', base: ExpressionNodeStorageValue, exponent: ExpressionNodeStorageValue }
export type FunctionStorageValue = PowerStorageValue

// Merge into a general Node type.
export type ExpressionNodeStorageValue = ConstantStorageValue | VariableStorageValue | ExpressionListStorageValue | FunctionStorageValue

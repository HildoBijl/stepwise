// Constants.
export type BaseConstantStorageValue = { value: number }
export type IntegerStorageValue = BaseConstantStorageValue & { subtype: 'Integer' }
export type FloatStorageValue = BaseConstantStorageValue & { subtype: 'Float' }
export type ConstantStorageValue = IntegerStorageValue | FloatStorageValue

// Variables.

// Functions.

// Merge into a general Node type.
export type ExpressionNodeStorageValue = ConstantStorageValue

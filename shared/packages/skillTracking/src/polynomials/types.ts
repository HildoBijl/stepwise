import { type NestedArray } from '@step-wise/utils'

export type PolynomialMatrix = NestedArray<number>
export type VariableList = string[]

export type SubstitutionValues = Record<string, number>
export type PolynomialExpression = {
	matrix: PolynomialMatrix
	list: VariableList
}

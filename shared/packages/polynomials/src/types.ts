import { type NestedArray } from '@step-wise/utils'

export type PolynomialMatrix = NestedArray<number>
export type VariableList = string[]
export type PolynomialExpression = { matrix: PolynomialMatrix, list: VariableList }
export type SubstitutionValues = Record<string, number>

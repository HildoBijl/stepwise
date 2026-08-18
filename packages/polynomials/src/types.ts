import { type NestedArray } from '@step-wise/js-utils'

// The nesting depth of the coefficients matches the number of variables. A polynomial without variables is therefore represented by a single number.
export type PolynomialMatrix = number | NestedArray<number>
export type VariableList = string[]
export type PolynomialExpression = { matrix: PolynomialMatrix, list: VariableList }
export type SubstitutionValues = Record<string, number>

import { type NestedArray } from '@step-wise/js-utils'

export type PolynomialCoefficients = number | NestedArray<number>
export type PolynomialVariables = readonly string[]
export type Polynomial = Readonly<{ coefficients: PolynomialCoefficients, variables: PolynomialVariables }>
export type PolynomialValues = Readonly<Record<string, number>>
export type PolynomialComparisonOptions = Readonly<{ allowVariableReordering?: boolean }>

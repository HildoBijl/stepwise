export type PolynomialExponents = readonly number[]
export type PolynomialTerm = Readonly<{ coefficient: number, exponents: PolynomialExponents }>
export type PolynomialTerms = readonly PolynomialTerm[]

export type PolynomialVariable = string
export type PolynomialVariables = readonly PolynomialVariable[]

export type Polynomial = Readonly<{ terms: PolynomialTerms, variables: PolynomialVariables }>

export type PolynomialValues = Readonly<Record<PolynomialVariable, number>>

export type PolynomialComparisonOptions = Readonly<{ allowVariableReordering?: boolean }>

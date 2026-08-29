export type PolynomialExponents = readonly number[]
export type PolynomialTerm = Readonly<{ coefficient: number, exponents: PolynomialExponents }>
export type PolynomialTerms = readonly PolynomialTerm[]
export type PolynomialVariables = readonly string[]
export type Polynomial = Readonly<{ terms: PolynomialTerms, variables: PolynomialVariables }>
export type PolynomialValues = Readonly<Record<string, number>>
export type PolynomialComparisonOptions = Readonly<{ allowVariableReordering?: boolean }>

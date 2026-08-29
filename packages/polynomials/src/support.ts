import type { PolynomialExponents } from './types.ts'

export function comparePolynomialExponents(exponents1: PolynomialExponents, exponents2: PolynomialExponents): number {
	for (let index = 0; index < exponents1.length; index++) {
		if (exponents1[index] !== exponents2[index]) return exponents1[index] - exponents2[index]
	}
	return 0
}

export function getPolynomialExponentsKey(exponents: PolynomialExponents): string {
	return exponents.join(',')
}

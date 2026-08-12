import { validateSimplificationOptions } from '.'

describe('simplification option validation', () => {
	test('accepts options whose requirements are met', () => {
		const options = new Set(['removeDoubleNegatives', 'removeDoubleSigns'] as const)
		expect(validateSimplificationOptions(options)).toBe(options)
	})

	test('rejects a missing requirement declared by a rule', () => {
		expect(() => validateSimplificationOptions(new Set(['removeDoubleSigns']))).toThrow('"removeDoubleSigns" requires "removeDoubleNegatives"')
	})

	test('rejects a conflict declared by the later rule', () => {
		expect(() => validateSimplificationOptions(new Set(['mergeFractionProducts', 'mergeFractionSums', 'splitFractions']))).toThrow('"splitFractions" conflicts with "mergeFractionSums"')
	})

	test('rejects both directions of root and fraction-exponent rewriting', () => {
		expect(() => validateSimplificationOptions(new Set(['turnRootsIntoFractionExponents', 'turnFractionExponentsIntoRoots']))).toThrow('"turnFractionExponentsIntoRoots" conflicts with "turnRootsIntoFractionExponents"')
	})
})

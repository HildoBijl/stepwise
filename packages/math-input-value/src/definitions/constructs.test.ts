import { describe, expect, it } from 'vitest'

import { constructDefinitions, constructTypes, getConstructTypeByAlias, isConstructType, opensExternalBracketGroup } from './constructs.ts'

describe('construct definitions', () => {
	it('lists every construct definition', () => {
		expect(constructTypes).toEqual(Object.keys(constructDefinitions))
	})

	it.each(constructTypes)('recognizes the %s construct', type => {
		expect(isConstructType(type)).toBe(true)
	})

	it.each(['', 'Unknown', 'toString'])('rejects the unknown construct %j', type => {
		expect(isConstructType(type)).toBe(false)
		expect(opensExternalBracketGroup(type)).toBe(false)
	})

	it.each([
		['/', 'Fraction'], ['sqrt(', 'SquareRoot'], ['root(', 'Root'], ['log(', 'Logarithm'], ['_', 'SubSup'], ['^', 'SubSup'],
	] as const)('maps alias %j to %s', (alias, type) => {
		expect(getConstructTypeByAlias(alias)).toBe(type)
	})

	it('returns undefined for unknown aliases', () => {
		expect(getConstructTypeByAlias('sin(')).toBeUndefined()
	})

	it('only treats logarithms as opening an external bracket group', () => {
		constructTypes.forEach(type => expect(opensExternalBracketGroup(type)).toBe(type === 'Logarithm'))
	})
})

import { describe, expect, test } from 'vitest'

import { product, sum, variable } from '../../../construction/index.ts'

import { collectVariables, collectVariableStrings, dependsOn, dependsOnAny, dependsOnlyOn } from './dependencyChecks.ts'

describe('variable dependencies', () => {
	const expression = sum(product(variable('x', '1'), 'y'), variable('x', '1'))

	test('collects unique variables and their strings', () => {
		expect(collectVariables(expression).map(node => node.symbol)).toEqual(['x', 'y'])
		expect(collectVariableStrings(expression)).toEqual(new Set(['x_1', 'y']))
	})

	test('checks individual and constrained dependencies', () => {
		expect(dependsOn(expression, variable('x', '1'))).toBe(true)
		expect(dependsOn(expression, 'z')).toBe(false)
		expect(dependsOnAny(expression, ['z', 'y'])).toBe(true)
		expect(dependsOnlyOn(expression, [variable('x', '1'), 'y'])).toBe(true)
		expect(dependsOnlyOn(expression, ['x'])).toBe(false)
	})
})

import { describe, expect, it } from 'vitest'

import { asExpression } from '@step-wise/cas'

import { selectExpressionParameters, selectRandomVariables } from './generationTools.ts'

describe('selectRandomVariables', () => {
	it('assigns distinct available variables to the requested names', () => {
		const variables = selectRandomVariables(['x', 'y', 'z'], ['first', 'second'])
		const values = Object.values(variables).map(variable => variable.toString())

		expect(Object.keys(variables)).toEqual(['first', 'second'])
		expect(values).toHaveLength(2)
		expect(new Set(values).size).toBe(2)
		expect(values.every(value => ['x', 'y', 'z'].includes(value))).toBe(true)
	})
})

describe('selectExpressionParameters', () => {
	it('selects requested variables and constants and converts them to expressions', () => {
		const parameters = { x: 'a + 1', c: 2, ignored: 3 }
		const selected = selectExpressionParameters(parameters, ['x'], ['c'])

		expect(Object.keys(selected)).toEqual(['x', 'c'])
		expect(selected.x.toString()).toBe(asExpression(parameters.x).toString())
		expect(selected.c.toString()).toBe(asExpression(parameters.c).toString())
	})
})

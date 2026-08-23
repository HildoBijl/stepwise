import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'
import { Float } from '@step-wise/physics-core'
import { describe, expect, it } from 'vitest'

import { compareInputs } from './compareInputs'
import { makeCheckInputData } from './testUtils'

describe('temporary domain comparison routing', () => {
	it('routes CAS comparisons', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('2x') }))).toBe(true)
	})

	it('routes physics comparisons', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: 'Float', value: { number: '3.0' } } }, { x: new Float('3.0') }))).toBe(true)
	})

	it('routes geometry comparisons', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: 'Vector', value: [2, 3] } }, { x: new Vector([2, 3]) }))).toBe(true)
	})

	it('routes mechanics comparisons', () => {
		expect(compareInputs('loads', makeCheckInputData({ loads: { type: 'FreeBodyDiagram', value: [] } }, { loads: [] }))).toBe(true)
	})
})

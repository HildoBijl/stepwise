import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'
import { PrecisionNumber } from '@step-wise/physics-core'
import { describe, expect, it } from 'vitest'

import { compareInputs } from './compareInputs.ts'
import { makeCheckInputData } from './testUtils.ts'

describe('temporary domain comparison routing', () => {
	it('routes CAS comparisons', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('2x') }))).toBe(true)
	})

	it('routes physics comparisons', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: 'PrecisionNumber', value: { number: '3.0' } } }, { x: new PrecisionNumber('3.0') }))).toBe(true)
	})

	it('routes geometry comparisons', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: 'Vector', value: [2, 3] } }, { x: new Vector([2, 3]) }))).toBe(true)
	})

	it('routes mechanics comparisons', () => {
		expect(compareInputs('loads', makeCheckInputData({ loads: { type: 'FreeBodyDiagram', value: [] } }, { loads: [] }))).toBe(true)
	})
})

import { describe, expect, it } from 'vitest'

import { createForce, createMoment, reverseLoad } from '@step-wise/engineering-mechanics'

import { getLoadDirectionIndices } from './support'

describe('getLoadDirectionIndices', () => {
	const externalLoad = createForce({ position: [2, 0], angle: -Math.PI / 2 })
	const reactionForce = createForce({ position: [0, 0], angle: 0 })
	const reactionMoment = createMoment({ position: [0, 0], clockwise: true })
	const solution = [externalLoad, reactionForce, reactionMoment]

	it('matches reordered reactions and detects reversed directions', () => {
		const input = [reverseLoad(reactionMoment), externalLoad, reverseLoad(reactionForce)]
		expect(getLoadDirectionIndices(input, solution)).toEqual([true, false, false])
	})

	it('keeps the solution directions when the input cannot be matched', () => {
		expect(getLoadDirectionIndices(undefined, solution)).toEqual([true, true, true])
		expect(getLoadDirectionIndices([externalLoad], solution)).toEqual([true, true, true])
	})
})

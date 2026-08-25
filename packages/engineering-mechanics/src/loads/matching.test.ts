import { describe, expect, it } from 'vitest'

import { createForce, createMoment } from './creation'
import { compareLoadLists, loadListsEqual } from './matching'

describe('load-list comparison', () => {
	const force = createForce({ position: [0, 0], angle: 0 })
	const moment = createMoment({ position: [1, 0], clockwise: true })

	it('matches reordered lists one-to-one', () => {
		const report = compareLoadLists([force, moment], [moment, force])
		expect(report).toEqual({ equal: true, inputMatching: [1, 0], solutionMatching: [1, 0] })
		expect(loadListsEqual([force, moment], [moment, force])).toBe(true)
	})

	it('handles duplicates as an unordered list rather than a set', () => {
		expect(loadListsEqual([force, force], [force, force])).toBe(true)
		expect(loadListsEqual([force], [force, force])).toBe(false)
	})

	it('returns useful partial matchings', () => {
		const otherForce = createForce({ position: [2, 0], angle: 0 })
		expect(compareLoadLists([force, otherForce], [force, moment])).toEqual({ equal: false, inputMatching: [0, undefined], solutionMatching: [0, undefined] })
	})

	it('applies custom comparison settings', () => {
		const reverse = createForce({ position: [3, 0], angle: Math.PI })
		expect(loadListsEqual([reverse], [force], { force: { position: 'sameLine', direction: 'parallel' } })).toBe(true)
	})
})

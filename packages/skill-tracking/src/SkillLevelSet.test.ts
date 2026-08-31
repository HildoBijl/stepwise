import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { compareNumberArrays } from '@step-wise/js-utils'
import { createSkillTree } from '@step-wise/skill-definition'

import { SkillLevelSet } from './SkillLevelSet.ts'
import { coefficientsToStoredSkillLevel, now, skillTree } from './testUtils.ts'

beforeEach(() => vi.useFakeTimers().setSystemTime(now))
afterEach(() => vi.useRealTimers())

describe('construction and access', () => {
	it('reports which skill levels and dependencies are loaded', () => {
		const linkedTree = createSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B' } })
		const incomplete = new SkillLevelSet(linkedTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(incomplete.hasSkillLevel('a')).toBe(true)
		expect(incomplete.hasSkillLevel('b')).toBe(false)
		expect(incomplete.hasRequiredDataFor('a')).toBe(false)
		expect(new SkillLevelSet(linkedTree, {
			a: coefficientsToStoredSkillLevel([1]),
			b: coefficientsToStoredSkillLevel([1]),
		}).hasRequiredDataFor('a')).toBe(true)
	})

	it('rejects unknown stored skills and access to unloaded levels', () => {
		expect(() => new SkillLevelSet(skillTree, { unknown: coefficientsToStoredSkillLevel([1]) })).toThrow()
		expect(() => new SkillLevelSet(skillTree).getSkillLevel('a')).toThrow()
	})
})

describe('updates', () => {
	it('accepts complete data for a new skill and rejects incomplete data', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(() => levels.applyUpdates({ b: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 1 } })).toThrow()
		levels.applyUpdates({ b: coefficientsToStoredSkillLevel([0, 1], now, 1) })
		expect(levels.getSkillLevel('b').numPracticed).toBe(1)
	})

	it('accepts newer updates and ignores stale or duplicate updates', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, 2) })
		const listener = vi.fn()
		levels.subscribe(listener)
		levels.applyUpdates({ a: { coefficients: [1, 0], coefficientsOn: new Date(now.getTime() - 1), numPracticed: 1 } })
		levels.applyUpdates({ a: { coefficients: [1], coefficientsOn: now, numPracticed: 2 } })
		expect(listener).not.toHaveBeenCalled()
		levels.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 3 } })
		expect(levels.getSkillLevel('a').numPracticed).toBe(3)
		expect(listener).toHaveBeenCalledOnce()
	})

	it.each([
		['an older date with a higher count', new Date(now.getTime() - 1), 3],
		['a newer date with a lower count', new Date(now.getTime() + 1), 1],
	])('rejects %s', (_description, coefficientsOn, numPracticed) => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, 2) })
		expect(() => levels.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn, numPracticed } })).toThrow(/Conflicting/)
	})

	it('rejects a conflicting update set atomically', () => {
		const levels = new SkillLevelSet(skillTree, {
			a: coefficientsToStoredSkillLevel([1], now, 2),
			b: coefficientsToStoredSkillLevel([1], now, 2),
		})
		expect(() => levels.applyUpdates({
			a: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() + 1), numPracticed: 3 },
			b: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() - 1), numPracticed: 3 },
		})).toThrow(/Conflicting/)
		expect(levels.getSkillLevel('a').coefficients).toEqual([1])
	})

	it('invalidates inferred values after a dependency changes', () => {
		const linkedTree = createSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B' } })
		const levels = new SkillLevelSet(linkedTree, {
			a: coefficientsToStoredSkillLevel([1]),
			b: coefficientsToStoredSkillLevel([1]),
		})
		vi.setSystemTime(new Date(now.getTime() + 1))
		const before = levels.getInferredCoefficients('a')
		levels.applyUpdates({ b: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 1 } })
		expect(compareNumberArrays(levels.getInferredCoefficients('a'), before)).toBe(false)
	})
})

describe('subscriptions', () => {
	it('changes its snapshot and notifies listeners only when data changes', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		const listener = vi.fn()
		const unsubscribe = levels.subscribe(listener)
		const initialSnapshot = levels.getSnapshot()
		levels.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 1 } })
		expect(levels.getSnapshot()).not.toBe(initialSnapshot)
		expect(listener).toHaveBeenCalledOnce()
		unsubscribe()
		levels.clear()
		expect(listener).toHaveBeenCalledOnce()
	})
})

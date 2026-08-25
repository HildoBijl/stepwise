import { describe, expect, it } from 'vitest'

import { defaultLoadComparisonOptions, freeBodyDiagramComparisonOptions, resolveForceComparisonOptions, resolveLoadComparisonOptions, resolveMomentComparisonOptions } from './comparisonOptions'

describe('load comparison options', () => {
	it('resolves force and moment defaults and overrides', () => {
		expect(resolveForceComparisonOptions()).toEqual({ position: 'equal', direction: 'equal', applicationPointAt: 'equal' })
		expect(resolveForceComparisonOptions({ direction: 'parallel' }).direction).toBe('parallel')
		expect(resolveMomentComparisonOptions()).toEqual({ position: 'equal', direction: 'equal', openingDirection: 'equal' })
		expect(resolveMomentComparisonOptions({ openingDirection: 'ignore' }).openingDirection).toBe('ignore')
	})

	it('resolves nested lowercase load options', () => {
		const options = resolveLoadComparisonOptions({ force: { direction: 'parallel' }, moment: { position: 'ignore' } })
		expect(options.force.direction).toBe('parallel')
		expect(options.moment.position).toBe('ignore')
	})

	it('returns frozen complete settings and presets', () => {
		const options = resolveLoadComparisonOptions()
		expect(Object.isFrozen(options)).toBe(true)
		expect(Object.isFrozen(options.force)).toBe(true)
		expect(defaultLoadComparisonOptions).toEqual(options)
		expect(freeBodyDiagramComparisonOptions.force).toMatchObject({ direction: 'parallel', applicationPointAt: 'ignore' })
		expect(freeBodyDiagramComparisonOptions.moment).toMatchObject({ direction: 'ignore', openingDirection: 'ignore' })
	})

	it('rejects invalid and inconsistent settings', () => {
		expect(() => resolveForceComparisonOptions({ direction: 'other' as never })).toThrow()
		expect(() => resolveMomentComparisonOptions({ openingDirection: 'other' as never })).toThrow()
		expect(() => resolveForceComparisonOptions({ position: 'sameLine', direction: 'ignore' })).toThrow()
	})
})

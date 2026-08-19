import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Vector } from '@step-wise/geometry'

import { useConsistentPoints } from './util'

describe('useConsistentPoints', () => {
	it('preserves equivalent Vector collections and replaces changed ones', () => {
		const initialPoints = [Vector.zero, new Vector(4, 4)]
		const { result, rerender } = renderHook(
			({ points }) => useConsistentPoints(points),
			{ initialProps: { points: initialPoints } },
		)

		rerender({ points: [new Vector(0, 0), new Vector(4, 4)] })
		expect(result.current).toBe(initialPoints)

		rerender({ points: [new Vector(0, 0), new Vector(5, 4)] })
		expect(result.current).not.toBe(initialPoints)
	})
})

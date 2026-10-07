import { describe, expect, it } from 'vitest'

import { engineeringAngleToPixel, engineeringDirectionToPixel } from './angles.ts'

describe('engineeringAngleToPixel', () => {
	it('converts screen-oriented angles to upward pixel coordinates', () => {
		expect(engineeringAngleToPixel(Math.PI / 4, 'up')).toBe(-Math.PI / 4)
	})

	it('preserves screen-oriented angles in downward pixel coordinates', () => {
		expect(engineeringAngleToPixel(Math.PI / 4, 'down')).toBe(Math.PI / 4)
	})
})

describe('engineeringDirectionToPixel', () => {
	it('uses decreasing angles for clockwise arcs in upward pixel coordinates', () => {
		expect(engineeringDirectionToPixel(true, 'up')).toBe(-1)
		expect(engineeringDirectionToPixel(false, 'up')).toBe(1)
	})

	it('uses increasing angles for clockwise arcs in downward pixel coordinates', () => {
		expect(engineeringDirectionToPixel(true, 'down')).toBe(1)
		expect(engineeringDirectionToPixel(false, 'down')).toBe(-1)
	})
})

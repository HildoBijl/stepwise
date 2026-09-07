import { describe, expect, it } from 'vitest'

import { colorToCss, colorToHex, mixColors, shiftColorBrightness } from './colors.ts'

describe('color conversion', () => {
	it('converts normalized colors to CSS and hexadecimal values', () => {
		expect(colorToCss([0, 0.5, 1])).toBe('rgba(0, 128, 255, 1)')
		expect(colorToHex([0, 0.5, 1])).toBe('0080ff')
	})

	it('rejects invalid color channels', () => {
		expect(() => colorToCss([0, 2, 0])).toThrow('not within the interval [0, 1]')
	})
})

describe('color adjustment', () => {
	it('mixes colors while preserving interpolated alpha', () => {
		expect(mixColors([0, 0, 0, 0], [1, 0.5, 0, 1], 0.25)).toEqual([0.25, 0.125, 0, 0.25])
	})

	it('lightens and darkens colors', () => {
		expect(shiftColorBrightness([0, 0, 0, 0.5], 0.25)).toEqual([0.25, 0.25, 0.25, 0.5])
		expect(shiftColorBrightness([1, 1, 1, 0.5], -0.25)).toEqual([0.75, 0.75, 0.75, 0.5])
	})
})

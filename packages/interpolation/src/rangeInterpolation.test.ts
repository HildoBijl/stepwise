import { describe, expect, it } from 'vitest'

import { getInterpolationFraction, interpolateRange } from './rangeInterpolation'

class TestNumber {
	constructor(readonly number: number) {}
	add(value: TestNumber): TestNumber { return new TestNumber(this.number + value.number) }
	subtract(value: TestNumber): TestNumber { return new TestNumber(this.number - value.number) }
	multiply(value: TestNumber | number): TestNumber { return new TestNumber(this.number * (typeof value === 'number' ? value : value.number)) }
	divide(value: TestNumber | number): TestNumber { return new TestNumber(this.number / (typeof value === 'number' ? value : value.number)) }
	compare(value: TestNumber): number { return this.number - value.number }
}

describe('range interpolation', () => {
	it('calculates fractions for numbers and number-like values', () => {
		expect(getInterpolationFraction(5, [0, 10])).toBe(0.5)
		expect(getInterpolationFraction(new TestNumber(5), [new TestNumber(0), new TestNumber(10)])).toBe(0.5)
	})

	it('rejects equal input endpoints', () => {
		expect(() => getInterpolationFraction(1, [1, 1])).toThrow(/endpoints must differ/)
		expect(() => interpolateRange(1, [2, 4], [1, 1])).toThrow(/endpoints must differ/)
	})

	it('interpolates numeric and number-like output ranges', () => {
		expect(interpolateRange(0.5, [2, 4], [0, 1])).toBe(3)
		expect(interpolateRange(0.5, [new TestNumber(2), new TestNumber(4)], [0, 1])).toEqual(new TestNumber(3))
	})

	it('returns undefined outside the range or with undefined output endpoints', () => {
		expect(interpolateRange(2, [2, 4], [0, 1])).toBeUndefined()
		expect(interpolateRange(0.5, [2, undefined] as never, [0, 1])).toBeUndefined()
	})

	it('rejects malformed ranges and incompatible value types', () => {
		expect(() => interpolateRange(0.5, [2, 4], [0] as never)).toThrow(/input range/)
		expect(() => interpolateRange(0.5, [2, 4], [new TestNumber(0), new TestNumber(1)] as never)).toThrow(/same value type/)
	})
})

import { Float, asFloat } from './Float'
import { deserializeFloat, serializeFloat } from './serialization'
import { floatToInputValue, interpretFloatInputValue, isFloatInputValue } from './inputValue'
	import { getRandomExponentialFloat, getRandomFloat } from './random'

describe('Float', () => {
	describe('construction', () => {
		test('constructs from storage values', () => {
			const x = new Float({ number: 31.415, significantDigits: 5, power: 0 })
			expect(x.number).toBe(31.415)
			expect(x.significantDigits).toBe(5)
			expect(x.power).toBe(0)
		})
		test('constructs from strings', () => {
			expect(new Float('031.41500').toStorageValue()).toEqual({ number: 31.415, significantDigits: 7, power: 0 })
			expect(new Float('3.14 * 10^2').toStorageValue()).toEqual({ number: 314, significantDigits: 3, power: 2 })
			expect(new Float('10^(-3)').toStorageValue()).toEqual({ number: 0.001, significantDigits: Infinity, power: -3 })
		})
		test('constructs from numbers as exact values', () => {
			expect(new Float(3.14).toStorageValue()).toEqual({ number: 3.14, significantDigits: Infinity })
		})
		test('asFloat keeps existing Float instances', () => {
			const x = new Float('3.14')
			expect(asFloat(x)).toBe(x)
			expect(asFloat('3.14')).toEqual(x)
		})
	})

	describe('display', () => {
		test('converts to strings', () => {
			expect(new Float('3.140').toString()).toBe('3.140')
			expect(new Float('3.14 * 10^2').toString()).toBe('3.14 * 10^2')
			expect(new Float('3.14 * 10^(-2)').toString()).toBe('3.14 * 10^(-2)')
			expect(new Float('10^3').toString()).toBe('10^3')
		})
		test('converts to tex', () => {
			expect(new Float('3.140').toTex()).toBe('3{,}140')
			expect(new Float('3.14 * 10^2').toTex()).toBe('3{,}14 \\cdot 10^{2}')
			expect(new Float('10^(-3)').toTex()).toBe('10^{-3}')
		})
		test('detects visible powers', () => {
			expect(new Float('3.14').hasVisiblePower()).toBe(false)
			expect(new Float('3.14 * 10^2').hasVisiblePower()).toBe(true)
			expect(new Float('10^2').hasVisiblePower()).toBe(true)
		})
	})

	describe('precision operations', () => {
		test('adjusts significant digits', () => {
			const x = new Float('3.140')
			expect(x.setSignificantDigits(2).toString()).toBe('3.1')
			expect(x.adjustSignificantDigits(-1).toString()).toBe('3.14')
			expect(x.setMinimumSignificantDigits(6).toString()).toBe('3.14000')
		})
		test('rounds to precision', () => {
			const x = new Float({ number: 3.14159, significantDigits: 3 })
			expect(x.roundToPrecision().number).toBe(3.14)
		})
		test('makes values exact', () => {
			const x = new Float('3.14').makeExact()
			expect(x.significantDigits).toBe(Infinity)
		})
	})

	describe('arithmetic', () => {
		test('adds and subtracts', () => {
			expect(new Float('16').add('2.8').toString()).toBe('19')
			expect(new Float('16').add('2.8', true).toString()).toBe('18.8')
			expect(new Float('16').subtract('2.8').toString()).toBe('13')
		})
		test('multiplies and divides', () => {
			expect(new Float('2.0').multiply('3.00').toString()).toBe('6.0')
			expect(new Float('6.00').divide('2.0').toString()).toBe('3.0')
		})
		test('handles signs, inverse and powers', () => {
			expect(new Float('3.0').negate().toString()).toBe('-3.0')
			expect(new Float('-3.0').abs().toString()).toBe('3.0')
			expect(new Float('2.0').invert().toString()).toBe('0.50')
			expect(new Float('2.0').toPower(3).toString()).toBe('8.0')
		})
		test('throws when inverting zero', () => {
			expect(() => new Float('0').invert()).toThrow()
		})
	})

	describe('comparison', () => {
		test('compares numeric size', () => {
			expect(new Float('3.0').compare('2.0')).toBe(1)
			expect(new Float('3.0').compare('4.0')).toBe(-1)
			expect(new Float('3.0').compare('3.0')).toBe(0)
		})
		test('checks equality using significant-digit precision', () => {
			expect(new Float('1.60').equals('1.604')).toBe(true)
			expect(new Float('1.60').equals('1.606')).toBe(false)
		})
		test('checks significant-digit tolerance', () => {
			expect(new Float('1.60').equals('1.6')).toBe(true)
			expect(new Float('1.60').equals('1.6', { significantDigitTolerance: 0 })).toBe(false)
			const result = new Float('1.60').checkEquality('1.6', { significantDigitTolerance: 0 })
			expect(result.significantDigits).toEqual({ equal: false, difference: -1, tolerance: 0 })
		})
		test('checks power when requested', () => {
			expect(new Float('1.2 * 10^3').equals('12 * 10^2')).toBe(true)
			expect(new Float('1.2 * 10^3').equals('12 * 10^2', { checkPower: true })).toBe(false)
			const result = new Float('1.2 * 10^3').checkEquality('12 * 10^2', { checkPower: true })
			expect(result.power).toEqual({ equal: false, difference: -1 })
		})
		test('reports numeric direction as input relative to reference', () => {
			expect(new Float('10').checkEquality('9').number.direction).toBe(-1)
			expect(new Float('10').checkEquality('11').number.direction).toBe(1)
		})
	})

	describe('serialization', () => {
		test('serializes and deserializes', () => {
			const x = new Float('3.14 * 10^2')
			const serialized = serializeFloat(x)
			expect(serialized).toEqual({
				type: 'Float',
				value: { number: 314, significantDigits: 3, power: 2 },
			})
			expect(deserializeFloat(serialized)).toEqual(x)
		})
	})

	describe('input values', () => {
		test('recognizes FloatInputValue objects', () => {
			expect(isFloatInputValue({ number: '3.14', power: '2' })).toBe(true)
			expect(isFloatInputValue({ number: '3.14' })).toBe(true)
			expect(isFloatInputValue({ number: 3.14 })).toBe(false)
			expect(isFloatInputValue({ number: '3.14', extra: 'nope' })).toBe(false)
		})
		test('interprets input values', () => {
			const x = interpretFloatInputValue({ number: '3.140', power: '2' })
			expect(x.toStorageValue()).toEqual({ number: 314, significantDigits: 4, power: 2 })
		})
		test('turns Floats back into input values', () => {
			expect(floatToInputValue(new Float('3.14'))).toEqual({ number: '3.14' })
			expect(floatToInputValue(new Float('3.14 * 10^2'))).toEqual({ number: '3.14', power: '2' })
		})
		test('throws on invalid input values', () => {
			expect(() => interpretFloatInputValue({ number: '' })).toThrow()
			expect(() => interpretFloatInputValue({ number: '-' })).toThrow()
			expect(() => interpretFloatInputValue({ number: '.' })).toThrow()
			expect(() => interpretFloatInputValue({ number: '3.14', power: '-' })).toThrow()
		})
	})

	describe('random floats', () => {
		test('generates floats within bounds', () => {
			for (let i = 0; i < 10; i++) {
				const x = getRandomFloat({ min: 2, max: 5 })
				expect(x.number).toBeGreaterThanOrEqual(2)
				expect(x.number).toBeLessThanOrEqual(5)
			}
		})
		test('generates exponential floats within bounds', () => {
			for (let i = 0; i < 10; i++) {
				const x = getRandomExponentialFloat({ min: 0.01, max: 100 })
				expect(x.number).toBeGreaterThanOrEqual(0.01)
				expect(x.number).toBeLessThanOrEqual(100)
			}
		})
	})
})

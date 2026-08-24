import { describe, expect, test } from 'vitest'

import { PrecisionNumber, asPrecisionNumber } from './PrecisionNumber'
import { deserializePrecisionNumber, serializePrecisionNumber } from './serialization'
import { precisionNumberToInputValue, interpretPrecisionNumberInputValue, isPrecisionNumberInputValue } from './inputValue'
import { getRandomExponentialPrecisionNumber, getRandomPrecisionNumber, resolveRandomExponentialPrecisionNumberOptions, resolveRandomPrecisionNumberOptions } from './random'

describe('PrecisionNumber', () => {
	describe('construction', () => {
		test('constructs from storage values', () => {
			const x = new PrecisionNumber({ number: 31.415, significantDigits: 5, power: 0 })
			expect(x.number).toBe(31.415)
			expect(x.significantDigits).toBe(5)
			expect(x.power).toBe(0)
			expect(new PrecisionNumber({ number: 2, significantDigits: 'Infinity' }).significantDigits).toBe(Infinity)
			expect(new PrecisionNumber({ number: 2, significantDigits: Infinity }).significantDigits).toBe(Infinity)
		})
		test('constructs from strings', () => {
			expect(new PrecisionNumber('031.41500').toStorageValue()).toEqual({ number: 31.415, significantDigits: 7, power: 0 })
			expect(new PrecisionNumber('3.14 * 10^2').toStorageValue()).toEqual({ number: 314, significantDigits: 3, power: 2 })
			expect(new PrecisionNumber('10^(-3)').toStorageValue()).toEqual({ number: 0.001, significantDigits: 'Infinity', power: -3 })
		})
		test('constructs from numbers as exact values', () => {
			expect(new PrecisionNumber(3.14).toStorageValue()).toEqual({ number: 3.14, significantDigits: 'Infinity' })
		})
		test('asPrecisionNumber keeps existing PrecisionNumber instances', () => {
			const x = new PrecisionNumber('3.14')
			expect(asPrecisionNumber(x)).toBe(x)
			expect(asPrecisionNumber('3.14')).toEqual(x)
		})
		test('rejects non-finite values', () => {
			expect(() => new PrecisionNumber(Infinity)).toThrow(/finite/)
			expect(() => new PrecisionNumber(-Infinity)).toThrow(/finite/)
			expect(() => new PrecisionNumber({ number: 2, significantDigits: '-Infinity' as never })).toThrow()
		})
	})

	describe('display', () => {
		test('converts to strings', () => {
			expect(new PrecisionNumber('3.140').toString()).toBe('3.140')
			expect(new PrecisionNumber('3.14 * 10^2').toString()).toBe('3.14 * 10^2')
			expect(new PrecisionNumber('3.14 * 10^(-2)').toString()).toBe('3.14 * 10^(-2)')
			expect(new PrecisionNumber('10^3').toString()).toBe('10^3')
		})
		test('converts to tex', () => {
			expect(new PrecisionNumber('3.140').toTex()).toBe('3{,}140')
			expect(new PrecisionNumber('3.14 * 10^2').toTex()).toBe('3{,}14 \\cdot 10^{2}')
			expect(new PrecisionNumber('10^(-3)').toTex()).toBe('10^{-3}')
		})
		test('detects visible powers', () => {
			expect(new PrecisionNumber('3.14').hasVisiblePower()).toBe(false)
			expect(new PrecisionNumber('3.14 * 10^2').hasVisiblePower()).toBe(true)
			expect(new PrecisionNumber('10^2').hasVisiblePower()).toBe(true)
		})
		test('preserves the precision of zero', () => {
			expect(new PrecisionNumber('0.00').decimals).toBe(2)
			expect(new PrecisionNumber('0.00').toString()).toBe('0.00')
			expect(new PrecisionNumber(0).setDecimals(2).toString()).toBe('0.00')
		})
	})

	describe('precision operations', () => {
		test('adjusts significant digits', () => {
			const x = new PrecisionNumber('3.140')
			expect(x.setSignificantDigits(2).toString()).toBe('3.1')
			expect(x.adjustSignificantDigits(-1).toString()).toBe('3.14')
			expect(x.setMinimumSignificantDigits(6).toString()).toBe('3.14000')
		})
		test('rounds to precision', () => {
			const x = new PrecisionNumber({ number: 3.14159, significantDigits: 3 })
			expect(x.roundToPrecision().number).toBe(3.14)
		})
		test('preserves decimals when rounding across a power of ten', () => {
			expect(new PrecisionNumber({ number: 9.99, significantDigits: 2 }).roundToPrecision().toString()).toBe('10.0')
			expect(new PrecisionNumber({ number: -9.99, significantDigits: 2 }).roundToPrecision().toString()).toBe('-10.0')
		})
		test('makes values exact', () => {
			const x = new PrecisionNumber('3.14').makeExact()
			expect(x.significantDigits).toBe(Infinity)
		})
	})

	describe('arithmetic', () => {
		test('adds and subtracts', () => {
			expect(new PrecisionNumber('16').add('2.8').toString()).toBe('19')
			expect(new PrecisionNumber('16').add('2.8', true).toString()).toBe('18.8')
			expect(new PrecisionNumber('16').subtract('2.8').toString()).toBe('13')
		})
		test('multiplies and divides', () => {
			expect(new PrecisionNumber('2.0').multiply('3.00').toString()).toBe('6.0')
			expect(new PrecisionNumber('6.00').divide('2.0').toString()).toBe('3.0')
		})
		test('handles signs, inverse and powers', () => {
			expect(new PrecisionNumber('3.0').negate().toString()).toBe('-3.0')
			expect(new PrecisionNumber('-3.0').abs().toString()).toBe('3.0')
			expect(new PrecisionNumber('2.0').invert().toString()).toBe('0.50')
			expect(new PrecisionNumber('2.0').toPower(3).toString()).toBe('8.0')
		})
		test('throws when inverting zero', () => {
			expect(() => new PrecisionNumber('0').invert()).toThrow()
		})
	})

	describe('comparison', () => {
		test('compares numeric size', () => {
			expect(new PrecisionNumber('3.0').compare('2.0')).toBe(1)
			expect(new PrecisionNumber('3.0').compare('4.0')).toBe(-1)
			expect(new PrecisionNumber('3.0').compare('3.0')).toBe(0)
		})
		test('checks equality using significant-digit precision', () => {
			expect(new PrecisionNumber('1.60').equals('1.604')).toBe(true)
			expect(new PrecisionNumber('1.60').equals('1.606')).toBe(false)
		})
		test('checks significant-digit tolerance', () => {
			expect(new PrecisionNumber('1.60').equals('1.6')).toBe(true)
			expect(new PrecisionNumber('1.60').equals('1.6', { significantDigitTolerance: 0 })).toBe(false)
			const result = new PrecisionNumber('1.60').checkEquality('1.6', { significantDigitTolerance: 0 })
			expect(result.significantDigits).toEqual({ equal: false, difference: -1, tolerance: 0 })
		})
		test('checks power when requested', () => {
			expect(new PrecisionNumber('1.2 * 10^3').equals('12 * 10^2')).toBe(true)
			expect(new PrecisionNumber('1.2 * 10^3').equals('12 * 10^2', { checkPower: true })).toBe(false)
			const result = new PrecisionNumber('1.2 * 10^3').checkEquality('12 * 10^2', { checkPower: true })
			expect(result.power).toEqual({ equal: false, difference: -1 })
		})
		test('reports numeric direction as input relative to reference', () => {
			expect(new PrecisionNumber('10').checkEquality('9').number.direction).toBe(-1)
			expect(new PrecisionNumber('10').checkEquality('11').number.direction).toBe(1)
		})
	})

	describe('serialization', () => {
		test('serializes and deserializes', () => {
			const x = new PrecisionNumber('3.14 * 10^2')
			const serialized = serializePrecisionNumber(x)
			expect(serialized).toEqual({
				type: 'PrecisionNumber',
				value: { number: 314, significantDigits: 3, power: 2 },
			})
			expect(deserializePrecisionNumber(serialized)).toEqual(x)
			const exact = new PrecisionNumber(2)
			const jsonValue = JSON.parse(JSON.stringify(serializePrecisionNumber(exact)))
			expect(jsonValue.value.significantDigits).toBe('Infinity')
			expect(deserializePrecisionNumber(jsonValue)).toEqual(exact)
		})
		test('rejects invalid serialized values', () => {
			expect(() => deserializePrecisionNumber({ type: 'Unit', value: { number: 3, significantDigits: 1 } })).toThrow(/serialized PrecisionNumber/)
			expect(() => deserializePrecisionNumber({ type: 'PrecisionNumber', value: { number: Infinity, significantDigits: 1 } })).toThrow(/finite/)
		})
	})

	describe('input values', () => {
		test('recognizes PrecisionNumberInputValue objects', () => {
			expect(isPrecisionNumberInputValue({ number: '3.14', power: '2' })).toBe(true)
			expect(isPrecisionNumberInputValue({ number: '3.14' })).toBe(true)
			expect(isPrecisionNumberInputValue({ number: 3.14 })).toBe(false)
			expect(isPrecisionNumberInputValue({ number: '3.14', extra: 'nope' })).toBe(false)
		})
		test('interprets input values', () => {
			const x = interpretPrecisionNumberInputValue({ number: '3.140', power: '2' })
			expect(x.toStorageValue()).toEqual({ number: 314, significantDigits: 4, power: 2 })
		})
		test('turns PrecisionNumber instances back into input values', () => {
			expect(precisionNumberToInputValue(new PrecisionNumber('3.14'))).toEqual({ number: '3.14' })
			expect(precisionNumberToInputValue(new PrecisionNumber('3.14 * 10^2'))).toEqual({ number: '3.14', power: '2' })
		})
		test('throws on invalid input values', () => {
			expect(() => interpretPrecisionNumberInputValue({ number: '' })).toThrow()
			expect(() => interpretPrecisionNumberInputValue({ number: '-' })).toThrow()
			expect(() => interpretPrecisionNumberInputValue({ number: '.' })).toThrow()
			expect(() => interpretPrecisionNumberInputValue({ number: '3.14', power: '-' })).toThrow()
			expect(() => interpretPrecisionNumberInputValue({ number: '3.14', power: '2junk' })).toThrow(/power/)
		})
	})

	describe('random precision numbers', () => {
		test('resolves random options and applies defaults', () => {
			expect(resolveRandomPrecisionNumberOptions({ min: 2, max: 5 })).toEqual({ min: 2, max: 5, decimals: undefined, significantDigits: undefined, round: true, prevent: [] })
			expect(resolveRandomExponentialPrecisionNumberOptions({ min: 2, max: 5, randomSign: true })).toEqual({ min: 2, max: 5, decimals: undefined, significantDigits: undefined, round: true, prevent: [], negative: false, randomSign: true })
		})
		test('generates precision numbers within bounds', () => {
			for (let i = 0; i < 10; i++) {
				const x = getRandomPrecisionNumber({ min: 2, max: 5 })
				expect(x.number).toBeGreaterThanOrEqual(2)
				expect(x.number).toBeLessThanOrEqual(5)
			}
		})
		test('generates exponential precision numbers within bounds', () => {
			for (let i = 0; i < 10; i++) {
				const x = getRandomExponentialPrecisionNumber({ min: 0.01, max: 100 })
				expect(x.number).toBeGreaterThanOrEqual(0.01)
				expect(x.number).toBeLessThanOrEqual(100)
			}
		})
		test('throws when prevented values make sampling impossible', () => {
			expect(() => getRandomPrecisionNumber({ min: 2, max: 2, prevent: 2 })).toThrow(/could not generate an allowed value/)
		})
	})
})

import { describe, expect, test } from 'vitest'

import { PrecisionNumber } from '../PrecisionNumber'
import { Unit } from '../Unit'

import { Quantity, asQuantity } from './Quantity'
import { deserializeQuantity, serializeQuantity } from './serialization'
import { quantityToInputValue, interpretQuantityInputValue, isQuantityInputValue } from './inputValue'
import { getRandomExponentialQuantity, getRandomQuantity, resolveRandomExponentialQuantityOptions, resolveRandomQuantityOptions } from './random'

describe('Quantity', () => {
	describe('construction', () => {
		test('constructs from strings', () => {
			expect(new Quantity('3.14 kg * m / s^2').toString()).toBe('3.14 kg * m / s^2')
			expect(new Quantity('2kg').toString()).toBe('2 kg')
			expect(new Quantity('10').toString()).toBe('10')
		})
		test('constructs from objects', () => {
			const x = new Quantity({ value: '3.14', unit: 'm / s' })
			expect(x.value).toEqual(new PrecisionNumber('3.14'))
			expect(x.unit).toEqual(new Unit('m / s'))
		})
		test('constructs from numbers and PrecisionNumber instances', () => {
			expect(new Quantity(3.14).toString()).toBe('3.14')
			expect(new Quantity(new PrecisionNumber('3.14')).toString()).toBe('3.14')
		})
		test('asQuantity keeps existing instances', () => {
			const x = new Quantity('3.14 m')
			expect(asQuantity(x)).toBe(x)
			expect(asQuantity('3.14 m')).toEqual(x)
		})
	})

	describe('serialization', () => {
		test('turns to and from storage values', () => {
			const x = new Quantity('3.14 kg * m / s^2')
			expect(x.toStorageValue()).toEqual({
				value: { number: 3.14, significantDigits: 3, power: 0 },
				unit: {
					numerator: [{ prefix: 'k', unit: 'g' }, { unit: 'm' }],
					denominator: [{ unit: 's', power: 2 }],
				},
			})
			expect(new Quantity(x.toStorageValue())).toEqual(x)
		})
		test('serializes and deserializes', () => {
			const x = new Quantity('3.14 m')
			const serialized = serializeQuantity(x)
			expect(serialized).toEqual({
				type: 'Quantity',
				value: {
					value: { number: 3.14, significantDigits: 3, power: 0 },
					unit: { numerator: [{ unit: 'm' }] },
				},
			})
			expect(deserializeQuantity(serialized)).toEqual(x)
		})
		test('rejects malformed serialized quantities', () => {
			expect(() => deserializeQuantity({ type: 'PrecisionNumber', value: {} })).toThrow(/serialized Quantity/)
			expect(() => deserializeQuantity({ type: 'Quantity', value: { value: { number: 1, significantDigits: 1 }, unit: { extra: true } } })).toThrow(/UnitStorageValue/)
		})
	})

	describe('display', () => {
		test('converts to strings', () => {
			expect(new Quantity('3.140 m').toString()).toBe('3.140 m')
			expect(new Quantity('3.14 * 10^2 Pa').toString()).toBe('3.14 * 10^2 Pa')
			expect(new Quantity('3.14').toString()).toBe('3.14')
		})
		test('converts to tex', () => {
			expect(new Quantity('3.14 m').toTex()).toBe('3{,}14\\ {\\color{#044488} {\\rm m}}')
			expect(new Quantity('3.14').toTex()).toBe('3{,}14')
			expect(new Quantity('-3.14 m').toTexWithSign()).toBe('-3{,}14\\ {\\color{#044488} {\\rm m}}')
			expect(new Quantity('3.14 m').toTexWithSign()).toBe('+3{,}14\\ {\\color{#044488} {\\rm m}}')
		})
	})

	describe('value operations', () => {
		test('maps basic value operations', () => {
			expect(new Quantity('3.0 m').negate().toString()).toBe('-3.0 m')
			expect(new Quantity('-3.0 m').abs().toString()).toBe('3.0 m')
			expect(new Quantity('3.14 m').makeExact().value.significantDigits).toBe(Infinity)
			expect(new Quantity('3.140 m').setSignificantDigits(2).toString()).toBe('3.1 m')
			expect(new Quantity('3.140 m').adjustSignificantDigits(-1).toString()).toBe('3.14 m')
			expect(new Quantity('3.140 m').setMinimumSignificantDigits(6).toString()).toBe('3.14000 m')
			expect(new Quantity({ value: { number: 3.14159, significantDigits: 3 }, unit: 'm' }).roundToPrecision().value.number).toBe(3.14)
		})
	})

	describe('arithmetic', () => {
		test('adds and subtracts compatible quantities', () => {
			expect(new Quantity('2.0 m').add('50 cm').toString()).toBe('2.5 m')
			expect(new Quantity('2.0 m').subtract('50 cm').toString()).toBe('1.5 m')
			expect(new Quantity('2.0 km').add('500 m').toString()).toBe('2.5 km')
		})
		test('throws when adding incompatible units', () => {
			expect(() => new Quantity('2 m').add('3 s')).toThrow()
		})
		test('multiplies and divides quantities', () => {
			expect(new Quantity('2.0 m').multiply('3.00 s').toString()).toBe('6.0 m * s')
			expect(new Quantity('6.00 m').divide('2.0 s').toString()).toBe('3.0 m / s')
		})
		test('inverts and raises to powers', () => {
			expect(new Quantity('2.0 m').invert().toString()).toBe('0.50 1 / m')
			expect(new Quantity('2.0 m').toPower(3).toString()).toBe('8.0 m^3')
			expect(new Quantity('2.0 m').toPower(new Quantity('3')).toString()).toBe('8.0 m^3')
			expect(() => new Quantity('2.0 m').toPower(new Quantity('3 s'))).toThrow()
		})
	})

	describe('unit adjustments and simplification', () => {
		test('sets equivalent units', () => {
			const temperature = new Quantity('20 °C')
			expect(temperature.setUnit('°C')).toBe(temperature)
			expect(new Quantity('2000 m').setUnit('km').toString()).toBe('2000 * 10^(-3) km')
			expect(new Quantity('2000 m').simplify().setUnit('km').toString()).toBe('2.000 km')
			expect(new Quantity('1 bar').setUnit('Pa').toString()).toBe('1 * 10^5 Pa')
		})
		test('throws when setting incompatible units', () => {
			expect(() => new Quantity('2 m').setUnit('s')).toThrow()
		})
		test('simplifies prefixes', () => {
			expect(new Quantity('2 km').simplify({ target: 'normalizedPrefixes' }).toString()).toBe('2 * 10^3 m')
			expect(new Quantity('2 ms').simplify({ target: 'normalizedPrefixes' }).toString()).toBe('2 * 10^(-3) s')
			expect(new Quantity('2 g').simplify({ target: 'normalizedPrefixes' }).toString()).toBe('2 * 10^(-3) kg')
		})
		test('simplifies to standard and base units', () => {
			expect(new Quantity('1 bar').simplify({ target: 'standard' }).toString()).toBe('1 * 10^5 Pa')
			expect(new Quantity('1 N').simplify({ target: 'base' }).toString()).toBe('1 kg * m / s^2')
		})
		test('handles affine unit conversions', () => {
			expect(new Quantity('20 °C').simplify({ target: 'standard' }).toString()).toBe('293 K')
			expect(new Quantity('293.15 K').setUnit('°C').toString()).toBe('20.00 °C')
		})
	})

	describe('comparison', () => {
		test('compares compatible units', () => {
			expect(new Quantity('2 m').compare('150 cm')).toBe(1)
			expect(new Quantity('2 m').compare('250 cm')).toBe(-1)
			expect(new Quantity('2 m').compare('200 cm')).toBe(0)
			expect(new Quantity('20 dC').compare('20 dC')).toBe(0)
		})
		test('checks equality with converted units', () => {
			expect(new Quantity('2.00 m').equals('200 cm')).toBe(true)
			expect(new Quantity('2.00 m').equals('2.00 s')).toBe(false)
		})
		test('rejects large relative errors for very small values', () => {
			expect(new Quantity('1.602176634 * 10^-19 C').equals('1.6 * 10^-17 C', { value: { relativeTolerance: 0.0001 } })).toBe(false)
		})
		test('returns structured equality results', () => {
			const result = new Quantity('2.00 m').checkEquality('201 cm')
			expect(result.equal).toBe(false)
			expect(result.value.number.direction).toBe(1)
			expect(result.unit.equal).toBe(true)
		})
		test('can enforce unit size equality', () => {
			expect(new Quantity('2 m').equals('200 cm', { unit: { checkSize: false } })).toBe(true)
			expect(new Quantity('2 m').equals('200 cm', { unit: { checkSize: true } })).toBe(false)
		})
		test('rejects invalid comparison options', () => {
			expect(() => new Quantity('2 m').equals('2 m', { value: { checkPower: 'yes' as never } })).toThrow(/boolean/)
			expect(() => new Quantity('2 m').equals('2 m', { unit: { target: 'invalid' as never } })).toThrow(/target/)
		})
	})

	describe('input values', () => {
		test('recognizes QuantityInputValue objects', () => {
			expect(isQuantityInputValue({ value: { number: '3.14' }, unit: { numerator: [{ text: 'm' }] } })).toBe(true)
			expect(isQuantityInputValue({ value: { number: '3.14' } })).toBe(true)
			expect(isQuantityInputValue({ unit: { numerator: [{ text: 'm' }] } })).toBe(false)
			expect(isQuantityInputValue({ value: { number: '3.14' }, extra: true })).toBe(false)
		})
		test('interprets input values', () => {
			const x = interpretQuantityInputValue({
				value: { number: '3.140', power: '2' },
				unit: { numerator: [{ text: 'kg' }, { text: 'm' }], denominator: [{ text: 's', power: '2' }] },
			})
			expect(x.toString()).toBe('3.140 * 10^2 kg * m / s^2')
		})
		test('turns Quantitys back into input values', () => {
			expect(quantityToInputValue(new Quantity('3.14 m / s^2'))).toEqual({
				value: { number: '3.14' },
				unit: {
					numerator: [{ text: 'm' }],
					denominator: [{ text: 's', power: '2' }],
				},
			})
		})
	})

	describe('random Quantitys', () => {
		test('resolves random Quantity options', () => {
			expect(resolveRandomQuantityOptions({ min: 2, max: 5, unit: 'm' })).toMatchObject({ min: 2, max: 5, round: true, prevent: [], unit: new Unit('m') })
			expect(resolveRandomExponentialQuantityOptions({ min: 2, max: 5, unit: 'm' })).toMatchObject({ min: 2, max: 5, negative: false, randomSign: false, unit: new Unit('m') })
		})
		test('generates Quantitys within bounds and with unit', () => {
			for (let i = 0; i < 10; i++) {
				const x = getRandomQuantity({ min: 2, max: 5, unit: 'm' })
				expect(x.number).toBeGreaterThanOrEqual(2)
				expect(x.number).toBeLessThanOrEqual(5)
				expect(x.unit.equals('m')).toBe(true)
			}
		})
		test('generates exponential Quantitys within bounds and with unit', () => {
			for (let i = 0; i < 10; i++) {
				const x = getRandomExponentialQuantity({ min: 0.01, max: 100, unit: 'Pa' })
				expect(x.number).toBeGreaterThanOrEqual(0.01)
				expect(x.number).toBeLessThanOrEqual(100)
				expect(x.unit.equals('Pa')).toBe(true)
			}
		})
	})
})

import { Float } from '../Float'
import { Unit } from '../Unit'

import { FloatUnit, asFloatUnit } from './FloatUnit'
import { deserializeFloatUnit, serializeFloatUnit } from './serialization'
import { floatUnitToInputValue, interpretFloatUnitInputValue, isFloatUnitInputValue } from './inputValue'

describe('FloatUnit', () => {
	describe('construction', () => {
		test('constructs from strings', () => {
			expect(new FloatUnit('3.14 kg * m / s^2').toString()).toBe('3.14 kg * m / s^2')
			expect(new FloatUnit('2kg').toString()).toBe('2 kg')
			expect(new FloatUnit('10').toString()).toBe('10')
		})
		test('constructs from objects', () => {
			const x = new FloatUnit({ float: '3.14', unit: 'm / s' })
			expect(x.float).toEqual(new Float('3.14'))
			expect(x.unit).toEqual(new Unit('m / s'))
		})
		test('constructs from numbers and Floats', () => {
			expect(new FloatUnit(3.14).toString()).toBe('3.14')
			expect(new FloatUnit(new Float('3.14')).toString()).toBe('3.14')
		})
		test('asFloatUnit keeps existing instances', () => {
			const x = new FloatUnit('3.14 m')
			expect(asFloatUnit(x)).toBe(x)
			expect(asFloatUnit('3.14 m')).toEqual(x)
		})
	})

	describe('serialization', () => {
		test('turns to and from storage values', () => {
			const x = new FloatUnit('3.14 kg * m / s^2')
			expect(x.toStorageValue()).toEqual({
				float: { number: 3.14, significantDigits: 3, power: 0 },
				unit: {
					numerator: [{ prefix: 'k', unit: 'g' }, { unit: 'm' }],
					denominator: [{ unit: 's', power: 2 }],
				},
			})
			expect(new FloatUnit(x.toStorageValue())).toEqual(x)
		})
		test('serializes and deserializes', () => {
			const x = new FloatUnit('3.14 m')
			const serialized = serializeFloatUnit(x)
			expect(serialized).toEqual({
				type: 'FloatUnit',
				value: {
					float: { number: 3.14, significantDigits: 3, power: 0 },
					unit: { numerator: [{ unit: 'm' }] },
				},
			})
			expect(deserializeFloatUnit(serialized)).toEqual(x)
		})
	})

	describe('display', () => {
		test('converts to strings', () => {
			expect(new FloatUnit('3.140 m').toString()).toBe('3.140 m')
			expect(new FloatUnit('3.14 * 10^2 Pa').toString()).toBe('3.14 * 10^2 Pa')
			expect(new FloatUnit('3.14').toString()).toBe('3.14')
		})
		test('converts to tex', () => {
			expect(new FloatUnit('3.14 m').toTex()).toBe('3.14\\ {\\color{#044488} {\\rm m}}')
			expect(new FloatUnit('3.14').toTex()).toBe('3.14')
			expect(new FloatUnit('-3.14 m').toTexWithPM()).toBe('-3.14\\ {\\color{#044488} {\\rm m}}')
			expect(new FloatUnit('3.14 m').toTexWithPM()).toBe('+3.14\\ {\\color{#044488} {\\rm m}}')
		})
	})

	describe('float operations', () => {
		test('maps basic float operations', () => {
			expect(new FloatUnit('3.0 m').negate().toString()).toBe('-3.0 m')
			expect(new FloatUnit('-3.0 m').abs().toString()).toBe('3.0 m')
			expect(new FloatUnit('3.14 m').makeExact().float.significantDigits).toBe(Infinity)
			expect(new FloatUnit('3.140 m').setSignificantDigits(2).toString()).toBe('3.1 m')
			expect(new FloatUnit('3.140 m').adjustSignificantDigits(-1).toString()).toBe('3.14 m')
			expect(new FloatUnit('3.140 m').setMinimumSignificantDigits(6).toString()).toBe('3.14000 m')
			expect(new FloatUnit({ float: { number: 3.14159, significantDigits: 3 }, unit: 'm' }).roundToPrecision().float.number).toBe(3.14)
		})
	})

	describe('arithmetic', () => {
		test('adds and subtracts compatible quantities', () => {
			expect(new FloatUnit('2.0 m').add('50 cm').toString()).toBe('2.5 m')
			expect(new FloatUnit('2.0 m').subtract('50 cm').toString()).toBe('1.5 m')
			expect(new FloatUnit('2.0 km').add('500 m').toString()).toBe('2.5 km')
		})
		test('throws when adding incompatible units', () => {
			expect(() => new FloatUnit('2 m').add('3 s')).toThrow()
		})
		test('multiplies and divides quantities', () => {
			expect(new FloatUnit('2.0 m').multiply('3.00 s').toString()).toBe('6.0 m * s')
			expect(new FloatUnit('6.00 m').divide('2.0 s').toString()).toBe('3.0 m / s')
		})
		test('inverts and raises to powers', () => {
			expect(new FloatUnit('2.0 m').invert().toString()).toBe('0.50 1 / m')
			expect(new FloatUnit('2.0 m').toPower(3).toString()).toBe('8.0 m^3')
			expect(new FloatUnit('2.0 m').toPower(new FloatUnit('3')).toString()).toBe('8.0 m^3')
			expect(() => new FloatUnit('2.0 m').toPower(new FloatUnit('3 s'))).toThrow()
		})
	})

	describe('unit adjustments and simplification', () => {
		test('sets equivalent units', () => {
			expect(new FloatUnit('2000 m').setUnit('km').toString()).toBe('2000 * 10^(-3) km')
			expect(new FloatUnit('2000 m').simplify().setUnit('km').toString()).toBe('2.000 km')
			expect(new FloatUnit('1 bar').setUnit('Pa').toString()).toBe('1 * 10^5 Pa')
		})
		test('throws when setting incompatible units', () => {
			expect(() => new FloatUnit('2 m').setUnit('s')).toThrow()
		})
		test('simplifies prefixes', () => {
			expect(new FloatUnit('2 km').simplify({ target: 'noPrefixes' }).toString()).toBe('2 * 10^3 m')
			expect(new FloatUnit('2 ms').simplify({ target: 'noPrefixes' }).toString()).toBe('2 * 10^(-3) s')
			expect(new FloatUnit('2 g').simplify({ target: 'noPrefixes' }).toString()).toBe('2 * 10^(-3) kg')
		})
		test('simplifies to standard and base units', () => {
			expect(new FloatUnit('1 bar').simplify({ target: 'standard' }).toString()).toBe('1 * 10^5 Pa')
			expect(new FloatUnit('1 N').simplify({ target: 'base' }).toString()).toBe('1 kg * m / s^2')
		})
		test('handles affine unit conversions', () => {
			expect(new FloatUnit('20 °C').simplify({ target: 'standard' }).toString()).toBe('293 K')
			expect(new FloatUnit('293.15 K').setUnit('°C').toString()).toBe('20.00 °C')
		})
	})

	describe('comparison', () => {
		test('compares compatible units', () => {
			expect(new FloatUnit('2 m').compare('150 cm')).toBe(1)
			expect(new FloatUnit('2 m').compare('250 cm')).toBe(-1)
			expect(new FloatUnit('2 m').compare('200 cm')).toBe(0)
		})
		test('checks equality with converted units', () => {
			expect(new FloatUnit('2.00 m').equals('200 cm')).toBe(true)
			expect(new FloatUnit('2.00 m').equals('2.00 s')).toBe(false)
		})
		test('returns structured equality results', () => {
			const result = new FloatUnit('2.00 m').checkEquality('201 cm')
			expect(result.equal).toBe(false)
			expect(result.float.number.direction).toBe(1)
			expect(result.unit.equal).toBe(true)
		})
		test('can enforce unit size equality', () => {
			expect(new FloatUnit('2 m').equals('200 cm', { unit: { checkSize: false } })).toBe(true)
			expect(new FloatUnit('2 m').equals('200 cm', { unit: { checkSize: true } })).toBe(false)
		})
	})

	describe('input values', () => {
		test('recognizes FloatUnitInputValue objects', () => {
			expect(isFloatUnitInputValue({ float: { number: '3.14' }, unit: { numerator: [{ text: 'm' }] } })).toBe(true)
			expect(isFloatUnitInputValue({ float: { number: '3.14' } })).toBe(true)
			expect(isFloatUnitInputValue({ unit: { numerator: [{ text: 'm' }] } })).toBe(false)
			expect(isFloatUnitInputValue({ float: { number: '3.14' }, extra: true })).toBe(false)
		})
		test('interprets input values', () => {
			const x = interpretFloatUnitInputValue({
				float: { number: '3.140', power: '2' },
				unit: { numerator: [{ text: 'kg' }, { text: 'm' }], denominator: [{ text: 's', power: '2' }] },
			})
			expect(x.toString()).toBe('3.140 * 10^2 kg * m / s^2')
		})
		test('turns FloatUnits back into input values', () => {
			expect(floatUnitToInputValue(new FloatUnit('3.14 m / s^2'))).toEqual({
				float: { number: '3.14' },
				unit: {
					numerator: [{ text: 'm' }],
					denominator: [{ text: 's', power: '2' }],
				},
			})
		})
	})
})

import { Unit, asUnit } from './Unit'
import { unitsEqual, unitsEquivalent, unitsSimilar } from './comparisonFunctions'

describe('Unit', () => {
	describe('construction', () => {
		test('constructs from strings', () => {
			expect(new Unit('kg * m / s^2').toString()).toBe('kg * m / s^2')
			expect(new Unit('m').toStorageValue()).toEqual({ numerator: [{ unit: 'm' }] })
			expect(new Unit('m / s^2').toStorageValue()).toEqual({ numerator: [{ unit: 'm' }], denominator: [{ unit: 's', power: 2 }] })
			expect(new Unit('/m').toStorageValue()).toEqual({ denominator: [{ unit: 'm' }] })
		})
		test('constructs from storage values', () => {
			const unit = new Unit({ numerator: [{ prefix: 'k', unit: 'g' }, { unit: 'm' }], denominator: [{ unit: 's', power: 2 }] })
			expect(unit.toString()).toBe('kg * m / s^2')
		})
		test('asUnit keeps existing Unit instances', () => {
			const unit = new Unit('kg * m / s^2')
			expect(asUnit(unit)).toBe(unit)
			expect(asUnit('kg * m / s^2')).toEqual(unit)
		})
		test('throws on invalid units', () => {
			expect(() => new Unit('unknown')).toThrow()
			expect(() => new Unit('m / s / kg')).toThrow()
			expect(() => new Unit('(m * s)')).toThrow()
		})
	})

	describe('display', () => {
		test('converts to strings', () => {
			expect(new Unit('').toString()).toBe('1')
			expect(new Unit('m').toString()).toBe('m')
			expect(new Unit('m * kg / s^2').toString()).toBe('m * kg / s^2')
			expect(new Unit('1 / s').toString()).toBe('1 / s')
		})
	})

	describe('basic properties', () => {
		test('detects empty forms', () => {
			expect(new Unit('').isEmpty()).toBe(true)
			expect(new Unit('m').isEmpty()).toBe(false)
		})
		test('detects standard prefix forms', () => {
			expect(new Unit('m').hasStandardPrefixes()).toBe(true)
			expect(new Unit('km').hasStandardPrefixes()).toBe(false)
			expect(new Unit('kg').hasStandardPrefixes()).toBe(true)
		})
		test('detects standard unit forms', () => {
			expect(new Unit('m').isInStandardUnits()).toBe(true)
			expect(new Unit('bar').isInStandardUnits()).toBe(false)
		})
		test('detects base forms', () => {
			expect(new Unit('m').isInBaseUnits()).toBe(true)
			expect(new Unit('N').isInBaseUnits()).toBe(false)
		})
	})

	describe('arithmetic', () => {
		test('inverts units', () => {
			expect(new Unit('m / s').invert().toString()).toBe('s / m')
			expect(new Unit('').invert()).toEqual(new Unit(''))
		})
		test('multiplies and divides units', () => {
			expect(new Unit('m').multiply('s').toString()).toBe('m * s')
			expect(new Unit('m').divide('s').toString()).toBe('m / s')
			expect(new Unit('').multiply('m').toString()).toBe('m')
			expect(new Unit('m').multiply('').toString()).toBe('m')
		})
		test('takes powers of units', () => {
			expect(new Unit('m / s^2').toPower(3).toString()).toBe('m^3 / s^6')
			expect(new Unit('m / s').toPower(-1).toString()).toBe('s / m')
			expect(new Unit('m / s').toPower(0).toString()).toBe('1')
			const unit = new Unit('m / s')
			expect(unit.toPower(1)).toBe(unit)
		})
	})

	describe('simplification', () => {
		test('combines equal unit elements', () => {
			expect(new Unit('dm^3 * dm^2 / dm^9').combine().toString()).toBe('1 / dm^4')
			expect(new Unit('m * s / m').combine().toString()).toBe('s')
			const unit = new Unit('m * s')
			expect(unit.combine()).toBe(unit)
		})
		test('sorts units', () => {
			expect(new Unit('s * kg * m').sort().toString()).toBe('kg * m * s')
		})
		test('removes prefixes and returns transformation data', () => {
			expect(new Unit('km').removePrefixesWithData()).toEqual({ unit: new Unit('m'), exponent: 3, factor: 1, difference: 0 })
			expect(new Unit('ms').removePrefixesWithData()).toEqual({ unit: new Unit('s'), exponent: -3, factor: 1, difference: 0 })
			expect(new Unit('km^2 / ms').removePrefixesWithData()).toEqual({ unit: new Unit('m^2 / s'), exponent: 9, factor: 1, difference: 0 })
		})
		test('converts to standard units and returns transformation data', () => {
			expect(new Unit('bar').toStandardUnitsWithData()).toEqual({ unit: new Unit('Pa'), exponent: 5, factor: 1, difference: 0 })
			expect(new Unit('l').toStandardUnitsWithData()).toEqual({ unit: new Unit('m^3'), exponent: -3, factor: 1, difference: 0 })
			expect(new Unit('°').toStandardUnitsWithData()).toEqual({ unit: new Unit('rad'), exponent: 0, factor: Math.PI / 180, difference: 0 })
			expect(new Unit('°C').toStandardUnitsWithData()).toEqual({ unit: new Unit('K'), exponent: 0, factor: 1, difference: 273.15 })
			expect(new Unit('J / °C').toStandardUnitsWithData().difference).toBe(0)
		})
		test('converts to base units', () => {
			expect(new Unit('N').toBaseUnits().toString()).toBe('kg * m / s^2')
			expect(new Unit('J').toBaseUnits().toString()).toBe('kg * m^2 / s^2')
			expect(new Unit('Hz').toBaseUnits().toString()).toBe('1 / s')
		})
		test('simplifies according to target', () => {
			expect(new Unit('km').simplifyWithData({ target: 'noPrefixes' })).toEqual({ unit: new Unit('m'), exponent: 3, factor: 1, difference: 0 })
			expect(new Unit('bar').simplifyWithData({ target: 'noPrefixes' })).toEqual({ unit: new Unit('bar'), exponent: 0, factor: 1, difference: 0 })
			expect(new Unit('bar').simplifyWithData({ target: 'standard' })).toEqual({ unit: new Unit('Pa'), exponent: 5, factor: 1, difference: 0 })
			expect(new Unit('N').simplifyWithData({ target: 'standard' }).unit.toString()).toBe('N')
			expect(new Unit('N').simplifyWithData({ target: 'base' }).unit.toString()).toBe('kg * m / s^2')
		})
	})

	describe('comparison', () => {
		test('checks exact equality', () => {
			expect(new Unit('m * s').equals('m * s', { target: 'unchanged' })).toBe(true)
			expect(new Unit('m * s').equals('s * m', { target: 'unchanged' })).toBe(true)
			expect(new Unit('m^2 / m').equals('m', { target: 'unchanged' })).toBe(true)
			expect(new Unit('km * ms').equals('ks * mm', { target: 'unchanged' })).toBe(false)
			expect(unitsEqual('m * s', 's * m')).toBe(true)
			expect(unitsEqual('km * ms', 'ks * mm')).toBe(false)
		})
		test('checks equality without prefixes', () => {
			expect(new Unit('km * ms').equals('ks * mm', { target: 'noPrefixes', checkSize: true })).toBe(true)
			expect(new Unit('km').equals('m', { target: 'noPrefixes', checkSize: false })).toBe(true)
			expect(new Unit('km').equals('m', { target: 'noPrefixes', checkSize: true })).toBe(false)
		})
		test('checks equality in standard units', () => {
			expect(new Unit('bar').equals('Pa', { target: 'standard', checkSize: false })).toBe(true)
			expect(new Unit('bar').equals('Pa', { target: 'standard', checkSize: true })).toBe(false)
			expect(new Unit('bar').equals('N / m^2', { target: 'standard', checkSize: false })).toBe(false)
		})
		test('checks equality in base units', () => {
			expect(new Unit('Pa').equals('kg / m * s^2', { target: 'base', checkSize: true })).toBe(true)
			expect(new Unit('bar').equals('kg / m * s^2', { target: 'base', checkSize: false })).toBe(true)
			expect(new Unit('bar').equals('kg / m * s^2', { target: 'base', checkSize: true })).toBe(false)
			expect(unitsEquivalent('Pa', 'kg / m * s^2')).toBe(true)
			expect(unitsEquivalent('bar', 'Pa')).toBe(false)
			expect(unitsSimilar('bar', 'Pa')).toBe(true)
			expect(unitsSimilar('m', 's')).toBe(false)
		})
		test('returns structured equality results', () => {
			const result = new Unit('m').checkEquality('km', { target: 'noPrefixes' })
			expect(result.form.equal).toBe(true)
			expect(result.size.equal).toBe(false)
			expect(result.size.exponentDifference).toBe(3)
			expect(result.equal).toBe(false)
		})
	})
})

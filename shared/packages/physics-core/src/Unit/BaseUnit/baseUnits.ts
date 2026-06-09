import { prefixes } from '../Prefix'

import { BaseUnit } from './BaseUnit'

export const specialUnitSymbols = ['Ω', 'μ', '°', '∘', '%']

export const baseUnitList = [
	new BaseUnit({ letter: 'm', name: 'meter', plural: 'meters', order: 3, standard: true, base: true }),
	new BaseUnit({ letter: 'g', name: 'gram', standardPrefix: prefixes.k, standard: true, base: true }),
	new BaseUnit({ letter: 's', name: 'second', plural: 'seconds', order: 3, standard: true, base: true }),
	new BaseUnit({ letter: 'K', name: 'Kelvin', standard: true, base: true }),
	new BaseUnit({ letter: 'A', name: 'Ampere', standard: true, base: true }),
	new BaseUnit({ letter: 'cd', name: 'Candela', standard: true, base: true }),
	new BaseUnit({ letter: 'mol', name: 'mole', standard: true, base: true }),

	new BaseUnit({ letter: 'N', name: 'Newton', standard: true, toBase: 'kg * m / s^2' }),
	new BaseUnit({ letter: 'J', name: 'Joule', standard: true, toBase: 'kg * m^2 / s^2' }),
	new BaseUnit({ letter: 'W', name: 'Watt', standard: true, toBase: 'kg * m^2 / s^3' }),
	new BaseUnit({ letter: 'Pa', name: 'Pascal', standard: true, toBase: 'kg / m * s^2' }),
	new BaseUnit({ letter: 'C', name: 'Coulomb', standard: true, toBase: 'A * s' }),
	new BaseUnit({ letter: 'V', name: 'Volt', standard: true, toBase: 'kg * m^2 / s^3 * A' }),
	new BaseUnit({ letter: 'Ω', alternatives: ['Ohm', 'Omega'], name: 'Ohm', standard: true, toBase: 'kg * m^2 / s^3 * A^2' }),
	new BaseUnit({ letter: 'F', name: 'Farad', standard: true, toBase: 'A^2 * s^4 / kg * m^2' }),
	new BaseUnit({ letter: 'rad', name: 'radian', plural: 'radians', standard: true, toBase: 'm / m' }),
	new BaseUnit({ letter: 'Hz', name: 'Hertz', standard: true, toBase: '1 / s' }),

	new BaseUnit({ letter: 'bar', name: 'bar', toStandard: { unit: 'Pa', exponent: 5 } }),
	new BaseUnit({ letter: '°C', name: 'degrees Celsius', alternatives: ['gC', 'dC', 'degC', '∘C'], toStandard: { unit: 'K', difference: 273.15 } }),
	new BaseUnit({ letter: 'l', name: 'liter', toStandard: { unit: 'm^3', exponent: -3 } }),
	new BaseUnit({ letter: '°', alternatives: ['deg', '∘'], name: 'degree', plural: 'degrees', toStandard: { unit: 'rad', factor: Math.PI / 180 } }),
	new BaseUnit({ letter: '%', name: 'percent', toStandard: { unit: '', exponent: -2 } }),
	new BaseUnit({ letter: 'h', name: 'hour', toStandard: { unit: 's', factor: 3600 } }),
	new BaseUnit({ letter: 'kWh', name: 'kilowatt-hour', toStandard: { unit: 'J', factor: 3600000 } }),
] as const

export const baseUnits = Object.fromEntries(baseUnitList.map(unit => [unit.letter, unit])) as Record<string, BaseUnit>

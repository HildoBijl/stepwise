import { prefixes } from '../Prefix'

import { UnitDefinition } from './UnitDefinition'

export const unitDefinitionList = [
	new UnitDefinition({ symbol: 'm', name: 'meter', plural: 'meters', order: 3, standard: true, base: true }),
	new UnitDefinition({ symbol: 'g', name: 'gram', standardPrefix: prefixes.k, standard: true, base: true }),
	new UnitDefinition({ symbol: 's', name: 'second', plural: 'seconds', order: 3, standard: true, base: true }),
	new UnitDefinition({ symbol: 'K', name: 'Kelvin', standard: true, base: true }),
	new UnitDefinition({ symbol: 'A', name: 'Ampere', standard: true, base: true }),
	new UnitDefinition({ symbol: 'cd', name: 'Candela', standard: true, base: true }),
	new UnitDefinition({ symbol: 'mol', name: 'mole', standard: true, base: true }),

	new UnitDefinition({ symbol: 'N', name: 'Newton', standard: true, toBase: 'kg * m / s^2' }),
	new UnitDefinition({ symbol: 'J', name: 'Joule', standard: true, toBase: 'kg * m^2 / s^2' }),
	new UnitDefinition({ symbol: 'W', name: 'Watt', standard: true, toBase: 'kg * m^2 / s^3' }),
	new UnitDefinition({ symbol: 'Pa', name: 'Pascal', standard: true, toBase: 'kg / m * s^2' }),
	new UnitDefinition({ symbol: 'C', name: 'Coulomb', standard: true, toBase: 'A * s' }),
	new UnitDefinition({ symbol: 'V', name: 'Volt', standard: true, toBase: 'kg * m^2 / s^3 * A' }),
	new UnitDefinition({ symbol: 'Ω', aliases: ['Ohm', 'Omega'], name: 'Ohm', standard: true, toBase: 'kg * m^2 / s^3 * A^2' }),
	new UnitDefinition({ symbol: 'F', name: 'Farad', standard: true, toBase: 'A^2 * s^4 / kg * m^2' }),
	new UnitDefinition({ symbol: 'rad', name: 'radian', plural: 'radians', standard: true, toBase: 'm / m' }),
	new UnitDefinition({ symbol: 'Hz', name: 'Hertz', standard: true, toBase: '1 / s' }),

	new UnitDefinition({ symbol: 'bar', name: 'bar', toStandard: { unit: 'Pa', decimalExponent: 5 } }),
	new UnitDefinition({ symbol: '°C', name: 'degrees Celsius', aliases: ['gC', 'dC', 'degC', '∘C'], toStandard: { unit: 'K', offset: 273.15 } }),
	new UnitDefinition({ symbol: 'l', name: 'liter', toStandard: { unit: 'm^3', decimalExponent: -3 } }),
	new UnitDefinition({ symbol: '°', aliases: ['deg', '∘'], name: 'degree', plural: 'degrees', toStandard: { unit: 'rad', factor: Math.PI / 180 } }),
	new UnitDefinition({ symbol: '%', name: 'percent', toStandard: { unit: '', decimalExponent: -2 } }),
	new UnitDefinition({ symbol: 'h', name: 'hour', toStandard: { unit: 's', factor: 3600 } }),
	new UnitDefinition({ symbol: 'kWh', name: 'kilowatt-hour', toStandard: { unit: 'J', factor: 3600000 } }),
] as const

export const unitDefinitions = Object.fromEntries(unitDefinitionList.map(unit => [unit.symbol, unit])) as Record<string, UnitDefinition>

export const specialUnitSymbols = ['Ω', 'μ', '°', '∘', '%']

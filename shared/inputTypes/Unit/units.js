const { BaseUnit } = require('./BaseUnit')
const { prefixes } = require('./prefixes')

// The special symbols used in units, other than the regular 26 alphabet letters. Note: this also includes prefix symbols.
const specialUnitSymbols = ['Ω', 'μ', '°', '∘', '%']
module.exports.specialUnitSymbols = specialUnitSymbols

// General overview of all units.
const unitList = [
	// Base units.
	new BaseUnit({ letter: 'm', name: 'meter', plural: 'meters', order: 3, standard: true, base: true, }), // The order is 0 for base units, 1 for standard (but non-base) units and 2 for non-base units. So making the order 3 puts this unit at the end of every unit string.
	new BaseUnit({ letter: 'g', name: 'gram', defaultPrefix: prefixes.k, standard: true, base: true, }),
	new BaseUnit({ letter: 's', name: 'second', plural: 'seconds', order: 3, standard: true, base: true, }),
	new BaseUnit({ letter: 'K', name: 'Kelvin', standard: true, base: true, }),
	new BaseUnit({ letter: 'A', name: 'Ampere', standard: true, base: true, }),
	new BaseUnit({ letter: 'cd', name: 'Candela', standard: true, base: true, }),
	new BaseUnit({ letter: 'mol', name: 'mole', standard: true, base: true, }),

	// Other standard units.
	new BaseUnit({ letter: 'N', name: 'Newton', standard: true, toBase: 'kg * m / s^2', }),
	new BaseUnit({ letter: 'J', name: 'Joule', standard: true, toBase: 'kg * m^2 / s^2', }),
	new BaseUnit({ letter: 'W', name: 'Watt', standard: true, toBase: 'kg * m^2 / s^3', }),
	new BaseUnit({ letter: 'Pa', name: 'Pascal', standard: true, toBase: 'kg / m * s^2', }),
	new BaseUnit({ letter: 'C', name: 'Coulomb', standard: true, toBase: 'A * s', }),
	new BaseUnit({ letter: 'V', name: 'Volt', standard: true, toBase: 'kg * m^2 / s^3 * A', }),
	new BaseUnit({ letter: 'Ω', alternatives: ['Ohm', 'Omega'], name: 'Ohm', standard: true, toBase: 'kg * m^2 / s^3 * A^2', }),
	new BaseUnit({ letter: 'F', name: 'Farad', standard: true, toBase: 'A^2 * s^4 / kg * m^2', }),
	new BaseUnit({ letter: 'rad', name: 'radian', plural: 'radians', standard: true, toBase: 'm / m', }),
	new BaseUnit({ letter: 'Hz', name: 'Hertz', standard: true, toBase: '1 / s', }),

	// Non-standard units. Add a toStandard property to indicate the conversion. In this, you can indicate the power (*10^x), the difference (addition) and the factor (multiplication). The unit is in a string form, since we cannot use the Unit object yet.
	new BaseUnit({ letter: 'bar', name: 'bar', toStandard: { unit: 'Pa', power: 5 }, }),
	new BaseUnit({ letter: '°C', name: 'degrees Celsius', alternatives: ['gC', 'dC', 'degC', '∘C'], toStandard: { unit: 'K', difference: 273.15 }, }), // The difference is only applied when the unit is on its own. Otherwise it is ignored.
	new BaseUnit({ letter: 'l', name: 'liter', toStandard: { unit: 'm^3', power: -3 }, }),
	new BaseUnit({ letter: '°', alternatives: ['deg', '∘'], name: 'degree', plural: 'degrees', toStandard: { unit: 'rad', factor: Math.PI / 180 }, }),
	new BaseUnit({ letter: '%', name: 'percent', toStandard: { unit: '', power: -2 }, }),
	new BaseUnit({ letter: 'h', name: 'hour', toStandard: { unit: 's', factor: 3600 }, }),
	new BaseUnit({ letter: 'kWh', name: 'kilowatt-hour', toStandard: { unit: 'J', factor: 3600000 } }),
]

// Turn the unit list into an object with the letter as key.
const units = {}
unitList.forEach(unit => units[unit.letter] = unit)
module.exports.units = units

// Find which unit corresponds to the given text. Return null when nothing is found.
function findUnit(str) {
	// Check input.
	if (typeof str !== 'string')
		throw new Error(`Invalid input: a string was expected, but received input type "${typeof str}".`)

	// Try to find the unit by the key.
	if (units[str])
		return units[str]

	// Try to find the unit by the alternatives.
	const unit = Object.values(units).find(unit => unit.equalsString(str))
	if (unit)
		return unit

	// Nothing found.
	return null
}
module.exports.findUnit = findUnit

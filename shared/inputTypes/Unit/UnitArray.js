// UnitArray is an array of UnitElements, representing their multiplication. So this could be "N * nm^2 * kg^3" but not "m / s". It does not have its own class (it's only a simple array, after all) but it does have auxiliary functions.

const { UnitElement } = require('./UnitElement')

// getUnitArrayFO interprets a unit multiplication like "m^2 * kg * s^3". It can either receive a string like this, or an array of unit elements. It returns an array with UnitElement objects.
function getUnitArrayFO(input) {
	// Check if we have a string. If so, do an extra check to see if it's empty.
	if (typeof input === 'string') {
		input = input.trim()
		if (input === '' || input === '1') // The '1' is useful for a unit like "1 / s".
			return []
		input = input.split('*')
	}

	// We have an array. Process each element individually. Filter out empty elements.
	return input.map(unitElement => new UnitElement(unitElement)).filter(unitElement => unitElement.prefix || unitElement.unit)
}
module.exports.getUnitArrayFO = getUnitArrayFO

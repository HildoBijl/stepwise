// UnitArray is an array of UnitElements, representing their multiplication. So this could be "N * nm^2 * kg^3" but not "m / s". It does not have its own class (it's only a simple array, after all) but it does have auxiliary functions.

const { UnitElement, isFOofType: isFOofTypeUnitElement, FOtoIO: unitElementFOtoIO, IOtoFO: unitElementIOtoFO, getEmpty: getEmptyUnitElement, isEmpty: isUnitElementEmpty } = require('./UnitElement')

// getUnitArrayFO interprets a unit multiplication like "m^2 * kg * s^3". It can either receive a string like this, or an array of unit elements. It returns an array with UnitElement objects.
function getUnitArrayFO(input) {
	// Check if we have a string. If so, do an extra check to see if it's empty.
	if (typeof input === 'string') {
		input = input.trim()
		if (input === '' || input === '1') // The '1' is useful for a unit like "1 / s".
			return []
		input = input.split('*')
	}

	// We have an array. Process each element individually.
	return input.map(unitElement => (isFOofTypeUnitElement(unitElement) ? unitElement : new UnitElement(unitElement)))
}
module.exports.getUnitArrayFO = getUnitArrayFO

// The following functions are obligatory functions.
function isFOofType(unitArray) {
	return Array.isArray(unitArray) && unitArray.every(unitElement => isFOofTypeUnitElement(unitElement))
}
module.exports.isFOofType = isFOofType

function FOtoIO(unitArray) {
	if (unitArray.length === 0)
		return getEmpty()
	return unitArray.map(unitElementFOtoIO)
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	return value.filter(unitElement => !isUnitElementEmpty(unitElement)).map(unitElementIOtoFO)
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return [getEmptyUnitElement()] // In the input object format unit arrays should always have at least one item (albeit an empty one).
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	return value.length === 0 || (value.length === 1 && isUnitElementEmpty(value[0]))
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	throw new Error(`The equals method is not implemented for unit arrays.`)
}
module.exports.equals = equals
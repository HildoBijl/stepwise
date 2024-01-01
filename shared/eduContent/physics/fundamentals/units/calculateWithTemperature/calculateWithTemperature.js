const { getRandomInteger, getRandomFloatUnit, Unit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

// Type 0: from K to °C.
// Type 1: from K to SI (so K: which it already is in).
// Type 2: from °C to K.
// Type 3: from °C to SI (so K).

const data = {
	skill: 'calculateWithTemperature',
	comparison: {
		absoluteMargin: 0.7,
		significantDigitMargin: 1,
		unitCheck: Unit.equalityTypes.sameUnits,
	},
}

function generateState() {
	const type = getRandomInteger(0, 3)
	let T = getRandomFloatUnit({
		min: 0,
		max: 1000,
		decimals: getRandomInteger(0, 1),
		unit: 'K',
	})
	if (type >= 2)
		T = T.setUnit('dC').roundToPrecision()
	return { T, type }
}

function getSolution({ T, type }) {
	T = T.simplify()
	return (type === 0 ? T.setUnit('dC') : T)
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('ans', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
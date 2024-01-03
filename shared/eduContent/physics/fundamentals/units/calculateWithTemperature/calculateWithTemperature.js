const { getRandomInteger, getRandomFloatUnit, Unit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

// Type 0: from K to °C.
// Type 1: from K to SI (so K: which it already is in).
// Type 2: from °C to K.
// Type 3: from °C to SI (so K).

const metaData = {
	skill: 'calculateWithTemperature',
	comparison: {
		default: {
			absoluteMargin: 0.7,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.sameUnits,
		},
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

function getSolution(state) {
	const T = state.T.simplify()
	return { ...state, ans: (state.type === 0 ? T.setUnit('dC') : T) }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

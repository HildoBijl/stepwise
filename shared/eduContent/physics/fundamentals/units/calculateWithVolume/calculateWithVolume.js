const { selectRandomly } = require('../../../../../util')
const { getRandomInteger, Unit, getRandomExponentialFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

// Type 0: from (c/d/.)m^3 to liter.
// Type 1: from (c/d/.)m^3 to SI (so m^3: which it may already be in).
// Type 2: from liter to m^3.
// Type 3: from liter to SI (so m^3).

const metaData = {
	skill: 'calculateWithVolume',
	comparison: {
		default: {
			relativeMargin: 0.001,
			significantDigitMargin: 0,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}

function generateState() {
	let V = getRandomExponentialFloatUnit({
		min: 1e-5,
		max: 1e2,
		significantDigits: getRandomInteger(2, 3),
		unit: 'm^3',
	})

	const type = getRandomInteger(0, 3)
	if (type < 2) {
		const prefix = selectRandomly(['', 'd', 'c'])
		V = V.setUnit(`${prefix}m^3`)
	} else {
		V = V.setUnit('l')
	}

	return { V, type }
}

function getSolution(state) {
	const V = state.V.simplify()
	return { ...state, ans: (state.type === 0 ? V.setUnit('l') : V) }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

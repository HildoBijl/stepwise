const { selectRandomly } = require('../../../../../util')
const { getRandomInteger, getRandomExponentialFloatUnit, Unit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

// Type 0: from (mu/m/./M)g to kg.
// Type 1: from (mu/m/./M)g to SI (so kg: which it may already be in).
// Type 2: from kg to (mu/m/./M)g.

const metaData = {
	skill: 'calculateWithMass',
	comparison: {
		default: {
			relativeMargin: 0.001,
			significantDigitMargin: 0,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}

function generateState() {
	const type = getRandomInteger(0, 2)
	const prefix = selectRandomly(['mu', 'm', '', 'M'])

	let m = getRandomExponentialFloatUnit({
		min: 1e-1,
		max: 1e3,
		significantDigits: getRandomInteger(2, 3),
		unit: `${prefix}g`,
	})

	if (type === 2)
		m = m.setUnit('kg')

	return { m, type, prefix }
}

function getSolution(state) {
	return { ...state, ans: (state.type === 2 ? state.m.setUnit(`${state.prefix}g`) : state.m.setUnit('kg')) }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

const { getRandomInteger } = require('@step-wise/utils')
const { Unit, getRandomExponentialFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

// Type 0: from Pa to bar.
// Type 1: from Pa to SI (so Pa: which it already is in).
// Type 2: from bar to Pa.
// Type 3: from bar to SI (so Pa).

const metaData = {
	skill: 'calculateWithPressure',
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 0,
			},
			unit: {
				target: 'standard',
			},
		},
	},
}

function generateState() {
	const type = getRandomInteger(0, 3)
	let p = getRandomExponentialFloatUnit({
		min: 1e3,
		max: 2e7,
		significantDigits: getRandomInteger(2, 3),
		unit: 'Pa',
	})
	if (type >= 2)
		p = p.setUnit('bar')
	return { p, type }
}

function getSolution(state) {
	const p = state.p.simplify()
	return { ...state, ans: (state.type === 0 ? p.setUnit('bar') : p) }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

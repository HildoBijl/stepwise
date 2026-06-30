const { sample, getRandomInteger } = require('@step-wise/utils')
const { Unit, getRandomExponentialFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

// Type 0: from (mu/m/./M)g to kg.
// Type 1: from (mu/m/./M)g to SI (so kg: which it may already be in).
// Type 2: from kg to (mu/m/./M)g.

const metaData = {
	skill: 'calculateWithMass',
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 0,
			},
			unit: {
				target: 'unchanged',
			},
		},
	},
}

function generateState() {
	const type = getRandomInteger(0, 2)
	const prefix = sample(['mu', 'm', '', 'M'])

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

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

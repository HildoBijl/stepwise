const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomExponentialFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getSimpleExerciseProcessor, performComparison } = require('../../../eduTools')

// Type 0: from Pa to bar.
// Type 1: from Pa to SI (so Pa: which it already is in).
// Type 2: from bar to Pa.
// Type 3: from bar to SI (so Pa).

const data = {
	skill: 'calculateWithPressure',
	comparison: {
		default: {
			relativeMargin: 0.001,
			significantDigitMargin: 0,
			unitCheck: Unit.equalityTypes.sameUnits,
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

function getSolution({ p, type }) {
	p = p.simplify()
	return (type === 0 ? p.setUnit('bar') : p)
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('ans', input, solution, data.comparison.default)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')

const data = {
	skill: 'calculateWithSpecificQuantities',
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const q = getRandomFloatUnit({
		min: 150,
		max: 250,
		unit: 'kJ/kg',
	})
	const Q = getRandomFloatUnit({
		min: 100,
		max: 200,
		decimals: -1,
		unit: 'MJ',
	}).setDecimals(0)
	const m = Q.divide(q).setUnit('kg').setDecimals(-1).roundToPrecision().setDecimals(0)

	return { Q, m }
}

function getSolution({ Q, m }) {
	Q = Q.simplify()
	q = Q.divide(m).setUnit('J/kg')
	return { Q, m, q }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('q', input, solution, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
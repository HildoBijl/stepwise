const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

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
	}).useDecimals(0)
	const m = Q.divide(q).setUnit('kg').useDecimals(-1).roundToPrecision().useDecimals(0)

	return { Q, m }
}

function getCorrect({ Q, m }) {
	Q = Q.simplify()
	q = Q.divide(m).setUnit('J/kg')
	return { Q, m, q }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('q', correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
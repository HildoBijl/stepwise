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
	const wt = getRandomFloatUnit({
		min: 600,
		max: 1200,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const m = getRandomFloatUnit({
		min: 2,
		max: 10,
		unit: 'Mg',
		significantDigits: 2,
	})

	return { wt, m }
}

function getSolution({ wt, m }) {
	wt = wt.simplify()
	m = m.simplify()
	const Wt = wt.multiply(m).setUnit('J')
	return { wt, m, Wt }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return checkParameter('Wt', solution, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
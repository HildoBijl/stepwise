const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithPressure',
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
		},
	},
}

function generateState() {
	const wt = getRandomFloatUnit({
		min: 200,
		max: 360,
		unit: 'kJ/kg',
		decimals: -1,
	}).useDecimals(0)
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 100,
		unit: 'g/s',
		significantDigits: 2,
	})
	const P = mdot.multiply(wt).setUnit('kW').roundToPrecision()

	return { mdot, P }
}

function getCorrect({ mdot, P }) {
	mdot = mdot.simplify()
	P = P.simplify()
	const wt = P.divide(mdot).setUnit('J/kg')
	return { mdot, P, wt }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('wt', correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
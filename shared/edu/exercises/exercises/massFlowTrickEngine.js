const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	setup: combinerAnd('calculateWithSpecificQuantities', 'massFlowTrick'),
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const rho = getRandomFloatUnit({
		min: 0.35,
		max: 0.6,
		unit: 'kg/m^3',
		significantDigits: 2,
	})
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 80,
		unit: 'kg/s',
		significantDigits: 2,
	})

	return { rho, mdot }
}

function getCorrect({ rho, mdot }) {
	const v = rho.invert()
	const Vdot = mdot.multiply(v).setUnit('m^3/s')
	return { rho, mdot, v, Vdot }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('Vdot', correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
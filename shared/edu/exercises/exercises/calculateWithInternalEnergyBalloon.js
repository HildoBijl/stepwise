const { getRandom } = require('../../../util/random')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
let { helium: { k } } = require('../../../data/gasProperties')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	setup: combinerAnd('calculateHeatAndWork', 'solveLinearEquation'),
	steps: ['calculateHeatAndWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const factor = getRandom(1.1, 1.25)
	const p = getRandomFloatUnit({
		min: 1.01,
		max: 1.10,
		decimals: 2,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 10,
		significantDigits: 2,
		unit: 'l',
	})
	const V2 = V1.multiply(factor)
	return { p, V1, V2 }
}

function getCorrect({ p, V1, V2 }) {
	p = p.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	const W = p.multiply(V2.subtract(V1)).setUnit('J')
	const Q = W.multiply(k.number/(k.number - 1))
	const dU = Q.subtract(W).useMinimumSignificantDigits(2)
	return { k, p, V1, V2, Q, W, dU }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['Q', 'W'], correct, input, data.equalityOptions)
		default:
			return checkParameter('dU', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

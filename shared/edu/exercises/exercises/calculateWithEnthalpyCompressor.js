const { getRandom } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
let { air: { Rs, k, cp } } = require('../../../data/gasProperties')
const { combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithEnthalpy',
	setup: combinerRepeat('solveLinearEquation', 2),
	steps: ['solveLinearEquation', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const n = getRandom(1.2, 1.38)
	const pressureRatio = getRandom(6, 9)
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const T2 = T1.simplify().multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setUnit('dC')
	const wt = Rs.multiply(-n / (n - 1)).multiply(T2.subtract(T1)).setUnit('kJ/kg')

	return { T1, T2, wt }
}

function getCorrect({ T1, T2, wt }) {
	wt = wt.simplify()
	cp = cp.simplify()
	const dh = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
	const q = dh.add(wt)
	return { cp, T1, T2, wt, dh, q }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('dh', correct, input, data.equalityOptions)
		default:
			return checkParameter('q', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

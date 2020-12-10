const { getRandom } = require('../../../util/random')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
let { air: { Rs, cv } } = require('../../../data/gasProperties')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	setup: combinerAnd('poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const n = getRandomFloat({
		min: 1.1,
		max: 1.3,
		decimals: 1,
	}).number
	const p2 = getRandomFloatUnit({
		min: 1.3,
		max: 1.8,
		decimals: 2,
		unit: 'bar',
	})
	const V2 = getRandomFloatUnit({
		min: 300,
		max: 600,
		significantDigits: 2,
		unit: 'cm^3',
	}).useDecimals(0)
	const volumeFactor = getRandom(15, 25) // = V1/V2
	const V1 = V2.divide(volumeFactor).useDecimals(0).roundToPrecision()
	const p1 = p2.multiply(Math.pow(volumeFactor, n)).useDecimals(0).roundToPrecision() // Poisson's law

	return { p1, V1, V2, n }
}

function getCorrect({ p1, V1, V2, n }) {
	p1 = p1.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	cv = cv.simplify()
	const p2 = p1.multiply(Math.pow(V1.number/V2.number, n))
	const diff = p2.multiply(V2).subtract(p1.multiply(V1)).setUnit('J')
	const c = cv.subtract(Rs.divide(n-1))
	const Q = c.divide(Rs).multiply(diff).setUnit('J')
	const W = diff.multiply(-1/(n-1))
	const dU = Q.subtract(W).useMinimumSignificantDigits(2)
	return { cv, Rs, c, p1, V1, p2, V2, n, Q, W, dU }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('p2', correct, input, data.equalityOptions)
		case 2:
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

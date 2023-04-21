const { getRandom } = require('../../../util/random')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
let { air: { Rs, cv } } = require('../../../data/gasProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateWithInternalEnergy',
	steps: ['poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const n = getRandomFloatUnit({
		min: 1.1,
		max: 1.3,
		decimals: 1,
		unit: '',
	})
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
	}).setDecimals(0)
	const volumeFactor = getRandom(15, 25) // = V2/V1
	const V1 = V2.divide(volumeFactor).setDecimals(0).roundToPrecision()
	const p1 = p2.multiply(Math.pow(volumeFactor, n.number)).setDecimals(0).roundToPrecision() // Poisson's law

	return { p1, V1, V2, n }
}

function getSolution({ p1, V1, V2, n }) {
	p1 = p1.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	cv = cv.simplify()
	const p2 = p1.multiply(Math.pow(V1.number / V2.number, n.number))
	const diff = p2.multiply(V2).subtract(p1.multiply(V1)).setUnit('J')
	const c = cv.subtract(Rs.divide(n.number - 1))
	const Q = c.divide(Rs).multiply(diff).setUnit('J').setMinimumSignificantDigits(2)
	const W = diff.multiply(-1 / (n.number - 1)).setMinimumSignificantDigits(2)
	const dU = Q.subtract(W).setMinimumSignificantDigits(2)
	return { cv, Rs, c, p1, V1, p2, V2, n, Q, W, dU }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('p2', input, solution, data.comparison)
		case 2:
			return performComparison(['Q', 'W'], input, solution, data.comparison)
		default:
			return performComparison('dU', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

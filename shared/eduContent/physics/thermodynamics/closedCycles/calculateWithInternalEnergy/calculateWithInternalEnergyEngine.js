const { getRandomNumber } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
let { air: { Rs, cv } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithInternalEnergy',
	steps: ['poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

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
	const volumeFactor = getRandomNumber(15, 25) // = V2/V1
	const V1 = V2.divide(volumeFactor).setDecimals(0).roundToPrecision()
	const p1 = p2.multiply(Math.pow(volumeFactor, n.number)).setDecimals(0).roundToPrecision() // Poisson's law

	return { p1, V1, V2, n }
}

function getSolution({ p1, V1, V2, n }) {
	const p1s = p1.simplify()
	const V1s = V1.simplify()
	const V2s = V2.simplify()
	cv = cv.simplify()
	const p2 = p1s.multiply(Math.pow(V1s.number / V2s.number, n.number))
	const p2s = p2.simplify()
	const diff = p2s.multiply(V2s).subtract(p1s.multiply(V1s)).setUnit('J')
	const c = cv.subtract(Rs.divide(n.number - 1))
	const Q = c.divide(Rs).multiply(diff).setUnit('J').setMinimumSignificantDigits(2)
	const W = diff.multiply(-1 / (n.number - 1)).setMinimumSignificantDigits(2)
	const dU = Q.subtract(W).setMinimumSignificantDigits(2)
	return { cv, Rs, c, p1s, V1s, p2, p2s, V2s, n, Q, W, dU }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'p2')
		case 2:
			return performComparison(exerciseData, ['Q', 'W'])
		default:
			return performComparison(exerciseData, 'dU')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

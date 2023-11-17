const { getRandom } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
let { air: { Rs, cv } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'calculateWithInternalEnergy',
	steps: ['gasLaw', 'specificHeats', 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		cv: {
			relativeMargin: 0.02,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p2 = getRandomFloatUnit({
		min: 2.5,
		max: 3.8,
		significantDigits: 2,
		unit: 'bar',
	})
	const V2 = getRandomFloatUnit({
		min: 1,
		max: 3,
		significantDigits: 2,
		unit: 'l',
	})
	const n = getRandom(1.1, 1.3)
	const pressureRatio = p2.number
	const T2 = T1.setUnit('K').multiply(Math.pow(pressureRatio, (n - 1) / n)).setUnit('dC').roundToPrecision()
	return { T1, p2, V2, T2 }
}

function getSolution({ T1, p2, V2, T2 }) {
	T1 = T1.simplify()
	p2 = p2.simplify()
	V2 = V2.simplify()
	T2 = T2.simplify()
	cv = cv.simplify()
	const m = p2.multiply(V2).divide(Rs.multiply(T2)).setUnit('kg')
	const dU = m.multiply(cv).multiply(T2.subtract(T1)).setUnit('J')
	return { cv, Rs, T1, p2, V2, T2, m, dU }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('m', input, solution, data.comparison)
		case 2:
			return performComparison('cv', input, solution, data.comparison)
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

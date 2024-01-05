const { getRandom } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
let { air: { Rs, cv } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
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
addSetupFromSteps(metaData)

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
	const T1s = T1.simplify()
	const p2s = p2.simplify()
	const V2s = V2.simplify()
	const T2s = T2.simplify()
	cv = cv.simplify()
	const m = p2s.multiply(V2s).divide(Rs.multiply(T2s)).setUnit('kg')
	const dU = m.multiply(cv).multiply(T2s.subtract(T1s)).setUnit('J')
	return { cv, Rs, T1s, p2s, V2s, T2s, m, dU }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'm')
		case 2:
			return performComparison(exerciseData, 'cv')
		default:
			return performComparison(exerciseData, 'dU')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

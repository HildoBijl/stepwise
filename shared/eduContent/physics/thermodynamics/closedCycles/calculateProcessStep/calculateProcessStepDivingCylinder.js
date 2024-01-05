const { getRandomInteger, getRandomFloatUnit } = require('../../../../../inputTypes')
const { oxygen: { Rs } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const comparison = {
	default: {
		relativeMargin: 0.015,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.7,
		significantDigitMargin: 1,
	},
}

const metaData = {
	skill: 'calculateProcessStep',
	steps: ['gasLaw', 'recognizeProcessTypes', 'gasLaw'],
	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const p1 = getRandomFloatUnit({
		min: 180,
		max: 300,
		significantDigits: 2,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: getRandomInteger(2, 3),
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 20,
		max: 35,
		significantDigits: 2,
		unit: 'dC',
	})
	const T2 = getRandomFloatUnit({
		min: 5,
		max: 15,
		significantDigits: 2,
		unit: 'dC',
	})

	const m = p1.multiply(V1).divide(Rs.multiply(T1.setUnit('K'))).setUnit('kg').roundToPrecision()

	return { m, p1, T1, T2 }
}

function getSolution({ m, p1, T1, T2 }) {
	const p1s = p1.simplify()
	const T1s = T1.simplify()
	const T2s = T2.simplify()
	const V1 = m.multiply(Rs).multiply(T1s).divide(p1s).setUnit('m^3')
	const V2 = V1
	const p2 = m.multiply(Rs).multiply(T2s).divide(V2).setUnit('Pa')
	return { process: 1, m, p1, T1, T2, Rs, p1s, p2, V1, V2, T1s, T2s }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1'])
		case 2:
			return performComparison(exerciseData, 'process')
		case 3:
			return performComparison(exerciseData, ['p2', 'V2', 'T2'])
		default:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

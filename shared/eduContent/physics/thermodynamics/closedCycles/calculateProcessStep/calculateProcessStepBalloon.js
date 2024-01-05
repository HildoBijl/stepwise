const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { Rs } } = require('../../../../../data/gasProperties')
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
		min: 1.02,
		max: 1.09,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 9,
		significantDigits: 2,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})
	const T2 = new FloatUnit('100 dC')

	const m = p1.setUnit('Pa').multiply(V1.setUnit('m^3')).divide(Rs.multiply(T1.setUnit('K'))).setUnit('g').roundToPrecision()

	return { m, V1, T1, T2 }
}

function getSolution({ m, V1, T1, T2 }) {
	const ms = m.simplify()
	const V1s = V1.simplify()
	const T1s = T1.simplify()
	const T2s = T2.simplify()
	const p1 = ms.multiply(Rs).multiply(T1s).divide(V1s).setUnit('Pa')
	const p2 = p1
	const V2 = ms.multiply(Rs).multiply(T2s).divide(p2).setUnit('m^3')
	return { process: 0, m, V1, T1, T2, ms, Rs, p1, p2, V1s, V2, T1s, T2s }
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

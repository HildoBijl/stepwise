const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { Rs, k } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const comparison = {
	default: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.7,
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

const metaData = {
	skill: 'calculateOpenProcessStep',
	steps: ['gasLaw', 'recognizeProcessTypes', 'gasLaw'],
	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const p1o = getRandomFloatUnit({
		min: 6,
		max: 14,
		unit: 'bar',
		significantDigits: 2,
	})
	const pressureRatio = p1o.number
	const T0o = getRandomFloatUnit({
		min: 275,
		max: 300,
		unit: 'K',
	})
	const T1o = T0o.multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setDecimals(-1).roundToPrecision().setDecimals(0)
	const T2o = getRandomFloatUnit({
		min: 900,
		max: 1300,
		unit: 'K',
		decimals: -1,
	}).setDecimals(0)

	return { p1o, T1o, T2o }
}

function getSolution({ p1o, T1o, T2o }) {
	const p1 = p1o.simplify()
	const T1 = T1o.simplify()
	const T2 = T2o.simplify()
	const p2 = p1
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	return { process: 0, Rs, p1, p2, v1, v2, T1, T2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'v1', 'T1'])
		case 2:
			return performComparison(exerciseData, 'process')
		case 3:
			return performComparison(exerciseData, ['p2', 'v2', 'T2'])
		default:
			return performComparison(exerciseData, ['p1', 'v1', 'T1', 'p2', 'v2', 'T2'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

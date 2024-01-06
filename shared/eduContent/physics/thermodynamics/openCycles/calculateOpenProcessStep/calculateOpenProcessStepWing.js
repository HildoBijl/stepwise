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
	steps: ['calculateWithSpecificQuantities', 'gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],
	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const p1o = getRandomFloatUnit({
		min: 200,
		max: 400,
		unit: 'mbar',
		decimals: -1,
	}).setDecimals(0)
	const p2o = p1o.divide(1.8).subtract(getRandomFloatUnit({
		min: 20,
		max: 40,
		unit: 'mbar',
	})).setDecimals(-1).roundToPrecision().setDecimals(0)
	const rho = getRandomFloatUnit({
		min: 0.4,
		max: 0.65,
		significantDigits: 2,
		unit: 'kg/m^3',
	})

	return { p1o, p2o, rho }
}

function getSolution({ p1o, p2o, rho }) {
	const p1 = p1o.simplify()
	const p2 = p2o.simplify()
	const v1 = rho.invert()
	const T1 = p1.multiply(v1).divide(Rs).setUnit('K')
	const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
	return { process: 3, Rs, k, rho, p1, p2, v1, v2, T1, T2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'v1')
		case 2:
			return performComparison(exerciseData, ['p1', 'v1', 'T1'])
		case 3:
			return performComparison(exerciseData, 'process')
		case 4:
			return performComparison(exerciseData, exerciseData.input.choice === 1 ? 'T2' : 'v2')
		case 5:
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

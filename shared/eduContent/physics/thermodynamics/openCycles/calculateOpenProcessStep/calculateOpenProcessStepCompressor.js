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
	steps: ['gasLaw', 'poissonsLaw', 'gasLaw'],
	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const p1o = getRandomFloatUnit({
		min: 1,
		max: 3,
		unit: 'bar',
		significantDigits: 2,
	})
	const p2o = getRandomFloatUnit({
		min: 8,
		max: 16,
		unit: 'bar',
		significantDigits: 2,
	})
	const T1o = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})
	const n = getRandomFloatUnit({
		min: 1.2,
		max: k.number,
		significantDigits: 3,
		unit: '',
	})

	return { p1o, p2o, T1o, n }
}

function getSolution({ p1o, p2o, T1o, n }) {
	const p1 = p1o.simplify()
	const p2 = p2o.simplify()
	const T1 = T1o.simplify()
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / n.number))
	const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
	return { Rs, n, p1, p2, v1, v2, T1, T2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'v1', 'T1'])
		case 2:
			return performComparison(exerciseData, exerciseData.input.choice === 1 ? 'T2' : 'v2')
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

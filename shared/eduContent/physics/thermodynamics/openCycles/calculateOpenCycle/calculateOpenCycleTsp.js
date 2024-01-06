const { selectRandomly } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateOpenCycle',
	steps: ['calculateOpenProcessStep', 'calculateOpenProcessStep'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const medium = selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const T1o = getRandomFloatUnit({
		min: 1,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1o = getRandomFloatUnit({
		min: 1,
		max: 2,
		significantDigits: 2,
		unit: 'bar',
	})
	const p2o = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})

	return { medium, p1o, T1o, p2o }
}

function getSolution({ medium, p1o, T1o, p2o }) {
	const { Rs, k } = gasProperties[medium]
	const p1 = p1o.simplify()
	const T1 = T1o.simplify()
	const p2 = p2o.simplify()
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const T2 = T1
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	const p3 = p1
	const v3 = v2.multiply(Math.pow(p2.number / p3.number, 1 / k.number))
	const T3 = p3.multiply(v3).divide(Rs).setUnit('K')
	return { medium, Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'v1', 'T1', 'p2', 'v2', 'T2'])
		case 2:
			return performComparison(exerciseData, ['p3', 'v3', 'T3'])
		default:
			return performComparison(exerciseData, ['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

const { selectRandomly } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateClosedCycle',
	steps: ['calculateProcessStep', 'calculateProcessStep'],
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
	const V1o = getRandomFloatUnit({
		min: 1,
		max: 3,
		significantDigits: 2,
		unit: 'm^3',
	})
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

	return { medium, p1o, V1o, T1o, p2o }
}

function getSolution({ medium, p1o, V1o, T1o, p2o }) {
	const { Rs, k } = gasProperties[medium]
	const p1 = p1o.simplify()
	const V1 = V1o.simplify()
	const T1 = T1o.simplify()
	const p2 = p2o.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const mRs = m.multiply(Rs)
	const T2 = T1
	const V2 = mRs.multiply(T2).divide(p2).setUnit('m^3')
	const V3 = V1
	const p3 = p2o.multiply(Math.pow(V2.number / V3.number, k.number))
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	return { medium, m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2'])
		case 2:
			return performComparison(exerciseData, ['p3', 'V3', 'T3'])
		default:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

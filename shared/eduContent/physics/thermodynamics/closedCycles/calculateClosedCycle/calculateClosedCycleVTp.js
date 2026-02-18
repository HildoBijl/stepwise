const { selectRandomly, getRandomNumber } = require('../../../../../util')
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
		min: 20,
		max: 80,
		significantDigits: 2,
		unit: 'l',
	})
	const T1o = getRandomFloatUnit({
		min: 1,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1o = getRandomFloatUnit({
		min: 2,
		max: 3,
		significantDigits: 2,
		unit: 'bar',
	})
	const scale = getRandomNumber(2, 4) // Increase in volume, temperature and pressure.
	const V3o = V1o.multiply(scale).roundToPrecision()

	const { Rs } = gasProperties[medium]
	const mo = p1o.setUnit('Pa').multiply(V1o.setUnit('m^3')).divide(Rs.multiply(T1o.setUnit('K'))).setUnit('g').roundToPrecision()

	return { medium, mo, p1o, T1o, V3o }
}

function getSolution({ medium, mo, p1o, T1o, V3o }) {
	const { Rs } = gasProperties[medium]
	const m = mo.simplify()
	const p1 = p1o.simplify()
	const T1 = T1o.simplify()
	const V3 = V3o.simplify()
	const mRs = m.multiply(Rs)
	const V1 = mRs.multiply(T1).divide(p1).setUnit('m^3')
	const p3 = p1
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	const T2 = T3
	const V2 = V1
	const p2 = mo.multiply(Rs).multiply(T2).divide(V2).setUnit('Pa')
	return { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p3', 'V3', 'T3'])
		case 2:
			return performComparison(exerciseData, ['p2', 'V2', 'T2'])
		default:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

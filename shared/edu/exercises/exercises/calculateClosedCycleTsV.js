const { selectRandomly } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const gasProperties = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const data = {
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
addSetupFromSteps(data)

function generateState() {
	const medium = selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V1 = getRandomFloatUnit({
		min: 1,
		max: 3,
		significantDigits: 2,
		unit: 'm^3',
	})
	const T1 = getRandomFloatUnit({
		min: 1,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = getRandomFloatUnit({
		min: 1,
		max: 2,
		significantDigits: 2,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})

	return { medium, p1, V1, T1, p2 }
}

function getSolution({ medium, p1, V1, T1, p2 }) {
	const { Rs, k } = gasProperties[medium]
	p1 = p1.simplify()
	V1 = V1.simplify()
	T1 = T1.simplify()
	p2 = p2.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const mRs = m.multiply(Rs)
	const T2 = T1
	const V2 = mRs.multiply(T2).divide(p2).setUnit('m^3')
	const V3 = V1
	const p3 = p2.multiply(Math.pow(V2.number / V3.number, k.number))
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	return { medium, m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], input, solution, data.comparison)
		case 2:
			return performComparison(['p3', 'V3', 'T3'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

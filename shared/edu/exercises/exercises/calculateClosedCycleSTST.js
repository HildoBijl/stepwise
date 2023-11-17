const { selectRandomly } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const gasProperties = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'calculateClosedCycle',
	steps: ['calculateProcessStep', 'calculateProcessStep', 'calculateProcessStep'],

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
		min: 4,
		max: 30,
		significantDigits: 2,
		unit: 'l',
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
	const p4 = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})

	const { Rs } = gasProperties[medium]
	const m = p1.setUnit('Pa').multiply(V1.setUnit('m^3')).divide(Rs.multiply(T1.setUnit('K'))).setUnit('g').roundToPrecision()

	return { medium, m, p1, V1, p2, p4 }
}

function getSolution({ medium, m, p1, V1, p2, p4 }) {
	const { Rs, k } = gasProperties[medium]
	m = m.simplify()
	p1 = p1.simplify()
	V1 = V1.simplify()
	p2 = p2.simplify()
	p4 = p4.simplify()

	const mRs = m.multiply(Rs)
	const T1 = p1.multiply(V1).divide(mRs).setUnit('K')
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(V2).divide(mRs).setUnit('K')
	const T4 = T1
	const V4 = mRs.multiply(T4).divide(p4).setUnit('m^3')
	const T3 = T2
	const V3 = V4.multiply(Math.pow(T4.number / T3.number, 1 / (k.number - 1)))
	const p3 = mRs.multiply(T3).divide(V3).setUnit('Pa')
	return { medium, m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], input, solution, data.comparison)
		case 2:
			return performComparison(['p4', 'V4', 'T4'], input, solution, data.comparison)
		case 3:
			return performComparison(['p3', 'V3', 'T3'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

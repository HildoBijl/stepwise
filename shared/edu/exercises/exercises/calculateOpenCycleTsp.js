const { selectRandomly } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const gasProperties = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const data = {
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
addSetupFromSteps(data)

function generateState() {
	const medium = selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
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

	return { medium, p1, T1, p2 }
}

function getSolution({ medium, p1, T1, p2 }) {
	const { Rs, k } = gasProperties[medium]
	p1 = p1.simplify()
	T1 = T1.simplify()
	p2 = p2.simplify()
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const T2 = T1
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	const p3 = p1
	const v3 = v2.multiply(Math.pow(p2.number / p3.number, 1 / k.number))
	const T3 = p3.multiply(v3).divide(Rs).setUnit('K')
	return { medium, Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], input, solution, data.comparison)
		case 2:
			return performComparison(['p3', 'v3', 'T3'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { air: { k, Rs } } = require('../../../data/gasProperties')
const { combinerRepeat } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateOpenCycle',
	setup: combinerRepeat('calculateOpenProcessStep', 3),
	steps: ['calculateOpenProcessStep', 'calculateOpenProcessStep', 'calculateOpenProcessStep'],

	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const T1 = getRandomFloatUnit({
		min: 275,
		max: 300,
		decimals: 0,
		unit: 'K',
	})
	const p1 = new FloatUnit('1.0 bar')
	const p2 = getRandomFloatUnit({
		min: 3,
		max: 6,
		significantDigits: 2,
		unit: 'bar',
	})
	const ratio = p2.number / p1.number
	const factor = Math.pow(ratio, 1 - 1 / k.number) // T2/T1
	const T3 = T1.add(getRandomFloatUnit({
		min: 5,
		max: 20,
		decimals: 0,
		unit: 'K',
	}))
	const T4 = T3.divide(factor).roundToPrecision()

	return { p1, T1, p2, T4 }
}

function getSolution({ p1, T1, p2, T4 }) {
	p1 = p1.simplify()
	T1 = T1.simplify()
	p2 = p2.simplify()
	T4 = T4.simplify()
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number
	const factor = Math.pow(ratio, 1 - 1 / k.number)
	const T2 = T1.multiply(factor)
	const T3 = T4.multiply(factor)
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	const v3 = Rs.multiply(T3).divide(p3).setUnit('m^3/kg')
	const v4 = Rs.multiply(T4).divide(p4).setUnit('m^3/kg')
	return { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], input, solution, data.comparison)
		case 2:
			return performComparison(['p4', 'v4', 'T4'], input, solution, data.comparison)
		case 3:
			return performComparison(['p3', 'v3', 'T3'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
let { air: { cp } } = require('../../../data/gasProperties')

const data = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeats', combinerOr('calculateWithMass', 'calculateWithTemperature', 'calculateWithSpecificQuantities')),
	steps: ['recognizeProcessTypes', null, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],

	equalityOptions: {
		cp: {
			relativeMargin: 0.02,
		},
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		T2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		q: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		wt: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const T1 = getRandomFloatUnit({
		min: 150,
		max: 300,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)
	const T2 = getRandomFloatUnit({
		min: 650,
		max: 800,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)

	return { T1, T2 }
}

function getSolution({ T1, T2 }) {
	cp = cp.simplify()
	const dT = T2.subtract(T1)
	const q = cp.multiply(dT).setUnit('J/kg')
	const wt = new FloatUnit('0 J/kg')
	return { process: 0, eq: 1, T1, T2, cp, q, wt }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return performComparison('Rs', input, solution, data.equalityOptions)
		case 4:
			return performComparison(['T1', 'T2'], input, solution, data.equalityOptions)
		default:
			return performComparison(['q', 'wt'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

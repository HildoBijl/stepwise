const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', combinerOr('specificHeats', 'specificGasConstant'), combinerOr('calculateWithMass', 'calculateWithTemperature')),
	steps: ['recognizeProcessTypes', null, ['specificHeats', 'specificGasConstant'], ['calculateWithMass', 'calculateWithTemperature'], 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		m: {
			relativeMargin: 0.001,
			unitCheck: Unit.equalityTypes.exact,
		},
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		T2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const m = getRandomFloatUnit({
		min: 20,
		max: 200,
		significantDigits: 2,
		unit: 'g',
	})
	const T1 = getRandomFloatUnit({
		min: 1,
		max: 10,
		decimals: 0,
		unit: 'dC',
	})
	const T2 = getRandomFloatUnit({
		min: 30,
		max: 60,
		decimals: 0,
		unit: 'dC',
	})

	return { gas, m, T1, T2 }
}

function getSolution({ gas, m, T1, T2 }) {
	let { cp, Rs } = gasProperties[gas]
	cp = cp.simplify()
	m = m.simplify()
	const dT = T2.subtract(T1)
	const Q = m.multiply(cp).multiply(dT).setUnit('J')
	const W = m.multiply(Rs).multiply(dT).setUnit('J')
	return { gas, process: 0, eq: 1, m, T1, T2, cp, Rs, Q, W }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			switch (substep) {
				case 1: return performComparison('cp', input, solution, data.equalityOptions)
				case 2: return performComparison('Rs', input, solution, data.equalityOptions)
			}
		case 4:
			switch (substep) {
				case 1: return performComparison('m', input, solution, data.equalityOptions)
				case 2: return performComparison(['T1', 'T2'], input, solution, data.equalityOptions)
			}
		default:
			return performComparison(['Q', 'W'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

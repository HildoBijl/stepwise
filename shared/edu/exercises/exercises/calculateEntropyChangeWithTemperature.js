const { Unit } = require('../../../inputTypes/Unit')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getRandomInteger, selectRandomly } = require('../../../util/random')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateEntropyChange',
	setup: combinerAnd('calculateWithTemperature', 'specificHeats', 'solveLinearEquation'),
	steps: ['calculateWithTemperature', 'specificHeats', 'solveLinearEquation'],
	weight: 2,

	equalityOptions: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		c: {
			relativeMargin: 0.015,
			accuracyFactor: 2,
		},
		T1: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
		T2: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}

function generateState() {
	const type = getRandomInteger(0, 2) // 0 isobaric, 1 isochoric, 2 isentropic
	const medium = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const T1 = getRandomFloatUnit({
		min: 200,
		max: 400,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)
	const T2 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const m = getRandomFloatUnit({
		min: 100,
		max: 800,
		decimals: -1,
		unit: 'g',
	}).setDecimals(0)

	return { type, medium, T1, T2, m }
}

function getSolution({ type, medium, T1, T2, m }) {
	T1 = T1.simplify()
	T2 = T2.simplify()
	m = m.simplify()
	const c = type === 0 ? gasProperties[medium].cp : type === 1 ? gasProperties[medium].cv : new FloatUnit('0 J/kg*K')
	const dS = m.multiply(c).multiply(Math.log(T2.number / T1.number)).setUnit('J/K')
	return { type, medium, T1, T2, m, c, dS }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['T1', 'T2'], input, solution, data.equalityOptions)
		case 2:
			return performComparison('c', input, solution, data.equalityOptions)
		default:
			return performComparison('dS', input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

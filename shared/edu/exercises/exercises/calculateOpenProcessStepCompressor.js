const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { air: { Rs, k } } = require('../../../data/gasProperties')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')

const comparison = {
	default: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.7,
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

const data = {
	skill: 'calculateOpenProcessStep',
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'poissonsLaw'),
	steps: ['gasLaw', 'poissonsLaw', 'gasLaw'],

	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}

function generateState() {
	const p1 = getRandomFloatUnit({
		min: 1,
		max: 3,
		unit: 'bar',
		significantDigits: 2,
	})
	const p2 = getRandomFloatUnit({
		min: 8,
		max: 16,
		unit: 'bar',
		significantDigits: 2,
	})
	const T1 = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})
	const n = getRandomFloatUnit({
		min: 1.2,
		max: k.number,
		significantDigits: 3,
		unit: '',
	})

	return { p1, p2, T1, n }
}

function getSolution({ p1, p2, T1, n }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	T1 = T1.simplify()
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / n.number))
	const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
	return { Rs, n, p1, p2, v1, v2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'v1', 'T1'], input, solution, data.comparison)
		case 2:
			const choice = input.choice || 0
			return performComparison(choice === 0 ? 'v2' : 'T2', input, solution, data.comparison)
		case 3:
			return performComparison(['p2', 'v2', 'T2'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

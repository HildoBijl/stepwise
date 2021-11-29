const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateProcessStep',
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'recognizeProcessTypes', 'poissonsLaw'),
	steps: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const gas = selectRandomly(['methane', 'helium', 'hydrogen'])
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 8,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 10,
		max: 30,
		decimals: 0,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const p2 = getRandomFloatUnit({
		min: 15,
		max: 40,
		unit: 'bar',
	})

	const { k, Rs } = gasProperties[gas]
	const m = p1.simplify().multiply(V1.simplify()).divide(Rs.multiply(T1.simplify())).setUnit('g').roundToPrecision()
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k)).roundToPrecision()

	return { gas, m, T1, V1, V2 }
}

function getSolution({ gas, m, T1, V1, V2 }) {
	const { k, Rs } = gasProperties[gas]
	m = m.simplify()
	T1 = T1.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	const p1 = m.multiply(Rs).multiply(T1).divide(V1).setUnit('Pa')
	const p2 = p1.multiply(Math.pow(V1.number / V2.number, k))
	const T2 = p2.multiply(V2).divide(m.multiply(Rs)).setUnit('K')
	return { k, Rs, m, p1, V1, T1, p2, V2, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1'], input, solution, data.equalityOptions)
		case 2:
			return input.process === 3
		case 3:
			const choice = input.choice || 0
			return performComparison(choice === 0 ? 'p2' : 'T2', input, solution, data.equalityOptions)
		case 4:
			return performComparison(['p2', 'V2', 'T2'], input, solution, data.equalityOptions)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { air: { k, Rs } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'calculateProcessStep',
	steps: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],

	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const m = getRandomFloatUnit({
		min: 500,
		max: 3000,
		significantDigits: 2,
		unit: 'kg',
	})
	const T1 = getRandomFloatUnit({
		min: 900,
		max: 1200,
		decimals: -1,
		unit: 'K',
	})
	const p1 = getRandomFloatUnit({
		min: 7,
		max: 11,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = new FloatUnit('1.0 bar')

	return { m, T1, p1, p2 }
}

function getSolution({ m, T1, p1, p2 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const V1 = m.multiply(Rs).multiply(T1).divide(p1).setUnit('m^3')
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(V2).divide(m.multiply(Rs)).setUnit('K')
	return { k, Rs, m, p1, V1, T1, p2, V2, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1'], input, solution, data.comparison)
		case 2:
			return input.process === 3
		case 3:
			const choice = input.choice || 0
			return performComparison(choice === 0 ? 'V2' : 'T2', input, solution, data.comparison)
		case 4:
			return performComparison(['p2', 'V2', 'T2'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

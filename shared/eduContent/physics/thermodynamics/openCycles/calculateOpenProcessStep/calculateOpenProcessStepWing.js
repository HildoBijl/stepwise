const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { Rs, k } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

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
	steps: ['calculateWithSpecificQuantities', 'gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],

	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}
addSetupFromSteps(data)

function generateState() {
	const p1 = getRandomFloatUnit({
		min: 200,
		max: 400,
		unit: 'mbar',
		decimals: -1,
	}).setDecimals(0)
	const p2 = p1.divide(1.8).subtract(getRandomFloatUnit({
		min: 20,
		max: 40,
		unit: 'mbar',
	})).setDecimals(-1).roundToPrecision().setDecimals(0)
	const rho = getRandomFloatUnit({
		min: 0.4,
		max: 0.65,
		significantDigits: 2,
		unit: 'kg/m^3',
	})

	return { p1, p2, rho }
}

function getSolution({ p1, p2, rho }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const v1 = rho.invert()
	const T1 = p1.multiply(v1).divide(Rs).setUnit('K')
	const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
	return { Rs, k, rho, p1, p2, v1, v2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('v1', input, solution, data.comparison)
		case 2:
			return performComparison(['p1', 'v1', 'T1'], input, solution, data.comparison)
		case 3:
			return input.process === 3
		case 4:
			const choice = input.choice || 0
			return performComparison(choice === 0 ? 'v2' : 'T2', input, solution, data.comparison)
		case 5:
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
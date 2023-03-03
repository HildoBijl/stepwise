const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { generateState, getSolution: getSolutionPrevious } = require('./calculateEntropyChangeWithProperties')

const data = {
	skill: 'calculateMissedWork',
	steps: ['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', null, 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}
addSetupFromSteps(data)

function getSolution(state) {
	const solution = getSolutionPrevious(state)
	let { T1, T2, ds: dsIn, c } = solution
	dsIn = dsIn.setDecimals(0)
	const q = c.multiply(T2.subtract(T1)).multiply(-1).setUnit('J/kg')
	const dsOut = q.divide(T1).setUnit('J/kg * K').setDecimals(0)
	const ds = dsIn.add(dsOut)
	const wm = T1.multiply(ds).setUnit('J/kg')
	return { ...solution, q, dsIn, dsOut, ds, wm }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('T2', input, solution, data.comparison)
		case 2:
			return performComparison('dsIn', input, solution, data.comparison)
		case 3:
			return performComparison('q', input, solution, data.comparison)
		case 4:
			return performComparison('dsOut', input, solution, data.comparison)
		case 5:
			return performComparison('ds', input, solution, data.comparison)
		default:
			return performComparison('wm', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

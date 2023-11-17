const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const { generateState, getSolution: getSolutionPrevious } = require('./calculateEntropyChangeIsotherm')

const data = {
	skill: 'calculateMissedWork',
	steps: ['calculateEntropyChange', 'solveLinearEquation'],

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
	const Wm = solution.dS.multiply(solution.Tc).setUnit('J')
	return { ...solution, Wm }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('dS', input, solution, data.comparison)
		default:
			return performComparison('Wm', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getSolutionPrevious } = require('../calculateEntropyChange/calculateEntropyChangeIsotherm')

const metaData = {
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
addSetupFromSteps(metaData)

function getSolution(state) {
	const solution = getSolutionPrevious(state)
	const Wm = solution.dS.multiply(solution.Tc).setUnit('J')
	return { ...solution, Wm }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'dS')
		default:
			return performComparison(exerciseData, 'Wm')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

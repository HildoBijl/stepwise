const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getSolutionPrevious } = require('../calculateEntropyChange/calculateEntropyChangeIsotherm')

const metaData = {
	skill: 'calculateMissedWork',
	...stepsToSetup(['calculateEntropyChange', 'solveLinearEquation']),
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

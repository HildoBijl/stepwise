const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { generateState, getSolution: getSolutionPrevious } = require('../calculateEntropyChange/calculateEntropyChangeIsotherm')

const metaData = {
	skill: 'calculateMissedWork',
	...stepsToSetup(['calculateEntropyChange', 'solveLinearEquation']),
	compare: {
		FloatUnit: {
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

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('dS', data)
		default:
			return compare('Wm', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

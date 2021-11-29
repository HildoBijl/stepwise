const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const { generateState, getSolution: getSolutionPrevious } = require('./calculateEntropyChangeIsotherm')

const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd('calculateEntropyChange', 'solveLinearEquation'),
	steps: ['calculateEntropyChange', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

function getSolution(state) {
	const solution = getSolutionPrevious(state)
	const Wm = solution.dS.multiply(solution.Tc).setUnit('J')
	return { ...solution, Wm }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('dS', input, solution, data.equalityOptions)
		default:
			return performComparison('Wm', input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

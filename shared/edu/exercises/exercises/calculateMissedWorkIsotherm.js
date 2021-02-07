const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCorrectPrevious } = require('./calculateEntropyChangeIsotherm')

const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd('calculateEntropyChange', 'solveLinearEquation'),
	steps: ['calculateEntropyChange', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCorrect(state) {
	const correct = getCorrectPrevious(state)
	const Wm = correct.dS.multiply(correct.Tc).setUnit('J')
	return { ...correct, Wm }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('dS', correct, input, data.equalityOptions)
		default:
			return checkParameter('Wm', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

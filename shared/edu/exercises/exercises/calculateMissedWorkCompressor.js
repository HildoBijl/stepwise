const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCorrectPrevious } = require('./calculateEntropyChangeWithProperties')

const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd('poissonsLaw', combinerRepeat('calculateEntropyChange', 2), 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', null, 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCorrect(state) {
	const correct = getCorrectPrevious(state)
	let { T1, T2, ds: dsIn, c } = correct
	dsIn = dsIn.setDecimals(0)
	const q = c.multiply(T2.subtract(T1)).multiply(-1).setUnit('J/kg')
	const dsOut = q.divide(T1).setUnit('J/kg * K').setDecimals(0)
	const ds = dsIn.add(dsOut)
	const wm = T1.multiply(ds).setUnit('J/kg')
	return { ...correct, q, dsIn, dsOut, ds, wm }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T2', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('dsIn', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('q', correct, input, data.equalityOptions)
		case 4:
			return checkParameter('dsOut', correct, input, data.equalityOptions)
		case 5:
			return checkParameter('ds', correct, input, data.equalityOptions)
		default:
			return checkParameter('wm', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

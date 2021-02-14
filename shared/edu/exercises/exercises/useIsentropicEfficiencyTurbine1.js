const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'useIsentropicEfficiency',
	setup: combinerAnd('calculateWithEnthalpy', 'solveLinearEquation'),
	steps: ['calculateWithEnthalpy', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	// ToDo later: use steam installation support function.	
	const etai = getRandomFloatUnit({
		min: 0.86,
		max: 0.98,
		unit: '',
	})
	const h1 = getRandomFloatUnit({
		min: 3100,
		max: 3600,
		decimals: -1,
		unit: 'kJ/kg',
	}).setDecimals(0)
	const h2p = getRandomFloatUnit({
		min: 2300,
		max: 2600,
		decimals: -1,
		unit: 'kJ/kg',
	}).setDecimals(0)
	const h2 = h1.subtract(h1.subtract(h2p).multiply(etai)).setDecimals(-1).roundToPrecision().setDecimals(0)
	return { h1, h2p, h2 }
}

function getCorrect({ h1, h2p, h2 }) {
	const wti = h1.subtract(h2p)
	const wt = h1.subtract(h2)
	const etai = wt.divide(wti).setUnit('').setDecimals(3)
	return { h1, h2p, h2, wti, wt, etai }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['wti', 'wt'], correct, input, data.equalityOptions)
		default:
			return checkParameter('etai', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
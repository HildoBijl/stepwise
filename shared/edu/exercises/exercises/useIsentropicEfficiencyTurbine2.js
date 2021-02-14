const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'useIsentropicEfficiency',
	setup: combinerAnd(combinerRepeat('calculateWithEnthalpy', 2), 'solveLinearEquation'),
	steps: ['calculateWithEnthalpy', 'solveLinearEquation', 'calculateWithEnthalpy'],

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
		min: 86,
		max: 98,
		decimals: 0,
		unit: '%',
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
	return { h1, h2p, etai }
}

function getCorrect({ h1, h2p, etai }) {
	etai = etai.simplify()
	const wti = h1.subtract(h2p)
	const wt = wti.multiply(etai).setDecimals(0)
	const h2 = h1.subtract(wt)
	return { h1, h2p, h2, wti, wt, etai }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('wti', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('wt', correct, input, data.equalityOptions)
		default:
			return checkParameter('h2', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

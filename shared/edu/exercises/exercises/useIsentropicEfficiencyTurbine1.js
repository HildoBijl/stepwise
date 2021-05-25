const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { getCycle } = require('./support/steamTurbineCycle')

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
	let { h2: h1, h3p: h2p, h3: h2 } = getCycle() // Cycle indices.
	h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2 = h2.setDecimals(-1).roundToPrecision().setDecimals(0)
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
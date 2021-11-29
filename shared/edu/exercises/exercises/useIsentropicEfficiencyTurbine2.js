const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const { getCycle } = require('./support/steamTurbineCycle')

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
	let { etai, h2: h1, h3p: h2p } = getCycle() // Cycle indices.
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision()
	h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
	return { h1, h2p, etai }
}

function getSolution({ h1, h2p, etai }) {
	etai = etai.simplify()
	const wti = h1.subtract(h2p)
	const wt = wti.multiply(etai).setDecimals(0)
	const h2 = h1.subtract(wt)
	return { h1, h2p, h2, wti, wt, etai }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('wti', input, solution, data.equalityOptions)
		case 2:
			return performComparison('wt', input, solution, data.equalityOptions)
		default:
			return performComparison('h2', input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

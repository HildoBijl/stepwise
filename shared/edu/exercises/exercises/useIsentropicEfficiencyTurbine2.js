const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const { getCycle } = require('./support/steamTurbineCycle')

const data = {
	skill: 'useIsentropicEfficiency',
	steps: ['calculateWithEnthalpy', 'solveLinearEquation', 'calculateWithEnthalpy'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

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
			return performComparison('wti', input, solution, data.comparison)
		case 2:
			return performComparison('wt', input, solution, data.comparison)
		default:
			return performComparison('h2', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

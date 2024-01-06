const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../../steam/rankineCycle')

const metaData = {
	skill: 'useIsentropicEfficiency',
	steps: ['calculateWithEnthalpy', 'solveLinearEquation'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	let { h2: h1, h3p: h2p, h3: h2 } = getCycle() // Cycle indices.
	h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2 = h2.setDecimals(-1).roundToPrecision().setDecimals(0)
	return { h1, h2p, h2 }
}

function getSolution({ h1, h2p, h2 }) {
	const wti = h1.subtract(h2p)
	const wt = h1.subtract(h2)
	const etai = wt.divide(wti).setUnit('').setDecimals(3)
	return { wti, wt, etai }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['wti', 'wt'])
		default:
			return performComparison(exerciseData, 'etai')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

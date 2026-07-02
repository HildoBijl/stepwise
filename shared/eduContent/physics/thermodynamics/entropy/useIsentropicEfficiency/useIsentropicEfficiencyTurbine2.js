const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../../steam/rankineCycle')

const metaData = {
	skill: 'useIsentropicEfficiency',
	...stepsToSetup(['calculateWithEnthalpy', 'solveLinearEquation', 'calculateWithEnthalpy']),
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	let { etai: etaio, h2: h1, h3p: h2p } = getCycle() // Cycle indices.
	etaio = etaio.setUnit('%').setDecimals(0).roundToPrecision()
	h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
	return { h1, h2p, etaio }
}

function getSolution({ h1, h2p, etaio }) {
	const etai = etaio.simplify()
	const wti = h1.subtract(h2p)
	const wt = wti.multiply(etai).setDecimals(0)
	const h2 = h1.subtract(wt)
	return { etai, wti, wt, h2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'wti')
		case 2:
			return performComparison(exerciseData, 'wt')
		default:
			return performComparison(exerciseData, 'h2')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

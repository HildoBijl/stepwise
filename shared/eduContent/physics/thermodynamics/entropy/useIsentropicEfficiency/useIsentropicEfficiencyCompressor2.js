const { gasProperties: { air: { k, cp } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../../gasTurbines')

const metaData = {
	skill: 'useIsentropicEfficiency',
	...stepsToSetup(['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation', 'calculateSpecificHeatAndMechanicalWork']),
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
	let { p1, T1, p2, etai: etaio } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	etaio = etaio.setUnit('%').setDecimals(0).roundToPrecision()
	return { p1, p2, T1, etaio }
}

function getSolution({ p1, p2, T1, etaio }) {
	const etai = etaio.simplify()
	const T2p = T1.multiply(p2.divide(p1).float.toPower(1 - 1 / k.number)).setDecimals(0)
	const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
	const wt = wti.divide(etai).setUnit('J/kg')
	const T2 = T1.add(wt.divide(cp)).setUnit('K').setDecimals(0)
	return { k, cp, etai, T2p, wti, wt, T2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'T2p')
		case 2:
			return performComparison(exerciseData, 'wti')
		case 3:
			return performComparison(exerciseData, 'wt')
		default:
			return performComparison(exerciseData, 'T2')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

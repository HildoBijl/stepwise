const { air: { k, cp } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../../gasTurbines')

const metaData = {
	skill: 'useIsentropicEfficiency',
	steps: ['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	let { p1, T1, p2, etai } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	const ratio = p2.number / p1.number
	const T2p = T1.multiply(Math.pow(ratio, 1 - 1 / k.number))
	const T2 = T1.add(T2p.subtract(T1).divide(etai)).setDecimals(0).roundToPrecision() // Recalculate to ensure that it's a valid value, and not an impossible one (etai > 1) due to rounding off of the pressure.
	return { p1, p2, T1, T2 }
}

function getSolution({ p1, p2, T1, T2 }) {
	const T2p = T1.multiply(p2.divide(p1).float.toPower(1 - 1 / k.number)).setDecimals(0)
	const wt = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
	const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
	const etai = wti.divide(wt).setUnit('')
	return { k, cp, T2p, wt, wti, etai }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'T2p')
		case 2:
			return performComparison(exerciseData, ['wt', 'wti'])
		default:
			return performComparison(exerciseData, 'etai')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

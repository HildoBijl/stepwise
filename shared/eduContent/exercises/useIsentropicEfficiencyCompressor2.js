const { air: { k, cp } } = require('../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../eduTools')

const { getCycle } = require('../physics/thermodynamics/gasTurbines')

const data = {
	skill: 'useIsentropicEfficiency',
	steps: ['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation', 'calculateSpecificHeatAndMechanicalWork'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	let { p1, T1, p2, etai } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision()
	return { p1, p2, T1, etai }
}

function getSolution({ p1, p2, T1, etai }) {
	etai = etai.simplify()
	const T2p = T1.multiply(p2.divide(p1).float.toPower(1 - 1 / k.number)).setDecimals(0)
	const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
	const wt = wti.divide(etai).setUnit('J/kg')
	const T2 = T1.add(wt.divide(cp)).setUnit('K').setDecimals(0)
	return { k, cp, p1, p2, T1, T2, T2p, wt, wti, etai }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('T2p', input, solution, data.comparison)
		case 2:
			return performComparison('wti', input, solution, data.comparison)
		case 3:
			return performComparison('wt', input, solution, data.comparison)
		default:
			return performComparison('T2', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

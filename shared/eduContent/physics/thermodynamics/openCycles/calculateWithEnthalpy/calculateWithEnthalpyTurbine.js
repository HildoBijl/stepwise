const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const data = {
	skill: 'calculateWithEnthalpy',
	steps: ['massFlowTrick', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const mdot = getRandomFloatUnit({
		min: 10,
		max: 50,
		decimals: 0,
		unit: 'kg/s',
	})
	const wt = getRandomFloatUnit({
		min: 600,
		max: 1200,
		unit: 'kJ/kg',
	})
	const P = mdot.multiply(wt).setUnit('MW').roundToPrecision()

	return { P, mdot }
}

function getSolution({ P, mdot }) {
	P = P.simplify()
	const wt = P.divide(mdot).setUnit('kJ/kg')
	const q = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { P, mdot, q, wt, dh }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('wt', input, solution, data.comparison)
		case 2:
			return performComparison('q', input, solution, data.comparison)
		default:
			return performComparison('dh', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

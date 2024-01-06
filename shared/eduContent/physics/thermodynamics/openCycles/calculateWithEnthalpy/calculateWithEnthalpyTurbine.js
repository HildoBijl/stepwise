const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEnthalpy',
	steps: ['massFlowTrick', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

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
	const Ps = P.simplify()
	const wt = P.divide(mdot).setUnit('kJ/kg')
	const q = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Ps, q, wt, dh }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'wt')
		case 2:
			return performComparison(exerciseData, 'q')
		default:
			return performComparison(exerciseData, 'dh')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

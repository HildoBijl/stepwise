const { and } = require('../../skillTracking')
const { getRandomFloatUnit } = require('../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../eduTools')

const data = {
	setup: and('calculateWithSpecificQuantities', 'massFlowTrick'),
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const rho = getRandomFloatUnit({
		min: 0.35,
		max: 0.6,
		unit: 'kg/m^3',
		significantDigits: 2,
	})
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 80,
		unit: 'kg/s',
		significantDigits: 2,
	})

	return { rho, mdot }
}

function getSolution({ rho, mdot }) {
	const v = rho.invert()
	const Vdot = mdot.multiply(v).setUnit('m^3/s')
	return { rho, mdot, v, Vdot }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('Vdot', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
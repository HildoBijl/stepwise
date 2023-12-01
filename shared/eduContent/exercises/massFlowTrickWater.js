const { getRandomFloatUnit } = require('../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../eduTools')

const data = {
	skill: 'massFlowTrick',
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const q = getRandomFloatUnit({
		min: 150,
		max: 250,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const mdot = getRandomFloatUnit({
		min: 0.2,
		max: 1,
		unit: 'kg/s',
		significantDigits: 2,
	})
	const Qdot = mdot.multiply(q).setUnit('kW').roundToPrecision()

	return { q, Qdot }
}

function getSolution({ q, Qdot }) {
	q = q.simplify()
	Qdot = Qdot.simplify()
	const mdot = Qdot.divide(q).setUnit('kg/s')
	return { mdot, q, Qdot }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('mdot', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
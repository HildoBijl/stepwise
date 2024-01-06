const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
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
	const qs = q.simplify()
	const Qdots = Qdot.simplify()
	const mdot = Qdots.divide(qs).setUnit('kg/s')
	return { qs, Qdots, mdot }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'mdot')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

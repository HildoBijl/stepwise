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
	const wt = getRandomFloatUnit({
		min: 200,
		max: 360,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 100,
		unit: 'g/s',
		significantDigits: 2,
	})
	const P = mdot.multiply(wt).setUnit('kW').roundToPrecision()

	return { mdot, P }
}

function getSolution({ mdot, P }) {
	const mdots = mdot.simplify()
	const Ps = P.simplify()
	const wt = P.divide(mdot).setUnit('J/kg')
	return { mdots, Ps, wt }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'wt')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

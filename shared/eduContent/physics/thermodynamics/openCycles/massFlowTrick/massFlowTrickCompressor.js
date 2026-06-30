const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'massFlowTrick',
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

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

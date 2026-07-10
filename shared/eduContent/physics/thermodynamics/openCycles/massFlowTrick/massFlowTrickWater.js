const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'massFlowTrick',
	compare: {
		FloatUnit: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
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

function checkInput(data) {
	return compare('mdot', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

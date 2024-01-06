const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithSpecificQuantities',
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
	})
	const Q = getRandomFloatUnit({
		min: 100,
		max: 200,
		decimals: -1,
		unit: 'MJ',
	}).setDecimals(0)
	const m = Q.divide(q).setUnit('kg').setDecimals(-1).roundToPrecision().setDecimals(0)

	return { Q, m }
}

function getSolution({ Q, m }) {
	const Qs = Q.simplify()
	const q = Qs.divide(m).setUnit('J/kg')
	return { Qs, q }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'q')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

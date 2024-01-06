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
	const wt = getRandomFloatUnit({
		min: 600,
		max: 1200,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const m = getRandomFloatUnit({
		min: 2,
		max: 10,
		unit: 'Mg',
		significantDigits: 2,
	})

	return { wt, m }
}

function getSolution({ wt, m }) {
	const wts = wt.simplify()
	const ms = m.simplify()
	const Wt = wts.multiply(ms).setUnit('J')
	return { wts, ms, Wt }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'Wt')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

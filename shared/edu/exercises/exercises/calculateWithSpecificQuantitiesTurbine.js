const { getRandomFloatUnit } = require('../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../eduTools')

const data = {
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
	wt = wt.simplify()
	m = m.simplify()
	const Wt = wt.multiply(m).setUnit('J')
	return { wt, m, Wt }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('Wt', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
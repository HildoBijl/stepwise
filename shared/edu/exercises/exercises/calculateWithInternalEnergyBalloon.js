const { getRandom } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
let { helium: { k } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'calculateWithInternalEnergy',
	steps: ['calculateHeatAndWork', 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const factor = getRandom(1.1, 1.25)
	const p = getRandomFloatUnit({
		min: 1.01,
		max: 1.10,
		decimals: 2,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 10,
		significantDigits: 2,
		unit: 'l',
	})
	const V2 = V1.multiply(factor).roundToPrecision()
	return { p, V1, V2 }
}

function getSolution({ p, V1, V2 }) {
	p = p.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	const W = p.multiply(V2.subtract(V1)).setUnit('J').setMinimumSignificantDigits(2)
	const Q = W.multiply(k.number / (k.number - 1)).setMinimumSignificantDigits(2)
	const dU = Q.subtract(W).setMinimumSignificantDigits(2)
	return { k, p, V1, V2, Q, W, dU }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['Q', 'W'], input, solution, data.comparison)
		default:
			return performComparison('dU', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { getRandom } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
let { helium: { k } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithInternalEnergy',
	steps: ['calculateHeatAndWork', 'solveLinearEquation'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

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
	const ps = p.simplify()
	const V1s = V1.simplify()
	const V2s = V2.simplify()
	const W = ps.multiply(V2s.subtract(V1s)).setUnit('J').setMinimumSignificantDigits(2)
	const Q = W.multiply(k.number / (k.number - 1)).setMinimumSignificantDigits(2)
	const dU = Q.subtract(W).setMinimumSignificantDigits(2)
	return { k, ps, V1s, V2s, Q, W, dU }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['Q', 'W'])
		default:
			return performComparison(exerciseData, 'dU')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

const { getRandomNumber } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { air: { Rs, k, cp } } } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEnthalpy',
	steps: ['solveLinearEquation', 'solveLinearEquation'],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const n = getRandomNumber(1.2, 1.38)
	const pressureRatio = getRandomNumber(6, 9)
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const T2 = T1.simplify().multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setUnit('dC').roundToPrecision()
	const wt = Rs.multiply(-n / (n - 1)).multiply(T2.subtract(T1)).setUnit('kJ/kg')

	return { T1, T2, wt }
}

function getSolution({ T1, T2, wt }) {
	const wts = wt.simplify()
	const cpSimplified = cp.simplify()
	const dh = cpSimplified.multiply(T2.subtract(T1)).setUnit('J/kg')
	const q = dh.add(wts)
	return { cp: cpSimplified, wts, dh, q }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'dh')
		default:
			return performComparison(exerciseData, 'q')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

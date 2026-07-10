const { getRandomNumber } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { air: { Rs, k, cp } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateWithEnthalpy',
	...stepsToSetup(['solveLinearEquation', 'solveLinearEquation']),
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

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('dh', data)
		default:
			return compare('q', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

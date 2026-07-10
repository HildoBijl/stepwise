const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { air: { cp } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	...stepsToSetup(['recognizeProcessTypes', undefined, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities']),
	compare: {
		cp: {
			float: {
				relativeTolerance: 0.02,
			},
		},
		T1: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
		},
		T2: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
		},
		q: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 1,
			},
		},
		wt: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const T1o = getRandomFloatUnit({
		min: 150,
		max: 300,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)
	const T2o = getRandomFloatUnit({
		min: 650,
		max: 800,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)

	return { T1o, T2o }
}

function getSolution({ T1o, T2o }) {
	const cpSimplified = cp.simplify()
	const T1 = T1o
	const T2 = T2o
	const dT = T2.subtract(T1)
	const q = cpSimplified.multiply(dT).setUnit('J/kg')
	const wt = new FloatUnit('0 J/kg')
	return { process: 0, eq: 1, T1, T2, cp: cpSimplified, q, wt }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('process', data)
		case 2:
			return compare('eq', data)
		case 3:
			return compare('cp', data)
		case 4:
			return compare(['T1', 'T2'], data)
		default:
			return compare(['q', 'wt'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

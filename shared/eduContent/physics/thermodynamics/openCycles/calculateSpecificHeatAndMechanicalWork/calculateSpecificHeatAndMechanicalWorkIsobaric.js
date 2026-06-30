const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { air: { cp } } } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	steps: ['recognizeProcessTypes', null, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],
	comparison: {
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
addSetupFromSteps(metaData)

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

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'process')
		case 2:
			return performComparison(exerciseData, 'eq')
		case 3:
			return performComparison(exerciseData, 'cp')
		case 4:
			return performComparison(exerciseData, ['T1', 'T2'])
		default:
			return performComparison(exerciseData, ['q', 'wt'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

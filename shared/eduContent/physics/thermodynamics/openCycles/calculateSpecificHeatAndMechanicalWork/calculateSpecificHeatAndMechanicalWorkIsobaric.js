const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
let { air: { cp } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	steps: ['recognizeProcessTypes', null, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],
	comparison: {
		cp: {
			relativeMargin: 0.02,
		},
		T1: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
		T2: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
		q: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		wt: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
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
	cp = cp.simplify()
	const T1 = T1o
	const T2 = T2o
	const dT = T2.subtract(T1)
	const q = cp.multiply(dT).setUnit('J/kg')
	const wt = new FloatUnit('0 J/kg')
	return { process: 0, eq: 1, T1, T2, cp, q, wt }
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

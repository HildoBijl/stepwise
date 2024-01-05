const { tableInterpolate, inverseTableInterpolate } = require('../../../../../util')
const { maximumHumidity } = require('../../../../../data/moistureProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../tools')

const metaData = {
	skill: 'analyseAirco',
	steps: ['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram', null],
	comparison: {
		default: { // AH
			absoluteMargin: .001, // In standard units, so kg/kg.
			significantDigitMargin: 1,
		},
		T3: {
			absoluteMargin: 1,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	let { T1, startRH, T4, endRH } = getCycle()
	T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
	T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
	startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
	endRH = endRH.setUnit('%').setDecimals(0).roundToPrecision()
	return { T1, startRH, T4, endRH }
}

function getSolution({ T1, startRH, T4, endRH }) {
	// Relative humidity.
	startRH = startRH.simplify()
	endRH = endRH.simplify()

	// Maximum humidity.
	const startAHmax = tableInterpolate(T1, maximumHumidity).setSignificantDigits(2)
	const endAHmax = tableInterpolate(T4, maximumHumidity).setSignificantDigits(2)

	// Absolute humidity.
	const startAH = startRH.multiply(startAHmax).setDecimals(0)
	const endAH = endRH.multiply(endAHmax).setDecimals(0)
	const dAH = startAH.subtract(endAH)

	// Temperatures.
	const T2 = inverseTableInterpolate(startAH, maximumHumidity).setDecimals(0)
	const T3 = inverseTableInterpolate(endAH, maximumHumidity).setDecimals(0)

	return { T2, T3, startAH, startAHmax, endAH, endAHmax, dAH }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'startAH')
		case 2:
			return performComparison(exerciseData, 'endAH')
		case 3:
			return performComparison(exerciseData, 'T3')
		case 4:
			return performComparison(exerciseData, 'dAH')
		default:
			return performComparison(exerciseData, ['T3', 'dAH'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

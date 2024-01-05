const { tableInterpolate, inverseTableInterpolate } = require('../../../../../util')
const { maximumHumidity } = require('../../../../../data/moistureProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../tools')

const metaData = {
	skill: 'analyseAirco',
	steps: ['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram'],
	comparison: {
		default: { // AH
			absoluteMargin: .001, // In standard units, so kg/kg.
			significantDigitMargin: 1,
		},
		endRH: {
			absoluteMargin: .04, // In standard units, so without percentage.
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	let { T1, T3, T4, startRH } = getCycle()
	T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
	T3 = T3.setDecimals(0).roundToPrecision().setDecimals(0)
	T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
	startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
	return { T1, T3, T4, startRH }
}

function getSolution({ T1, T3, T4, startRH }) {
	startRH = startRH.simplify()
	const startAHmax = tableInterpolate(T1, maximumHumidity).setSignificantDigits(2)
	const startAH = startRH.multiply(startAHmax)
	const endAH = tableInterpolate(T3, maximumHumidity).setSignificantDigits(2)
	const endAHmax = tableInterpolate(T4, maximumHumidity).setSignificantDigits(2)
	const endRH = endAH.divide(endAHmax).setUnit('')
	const T2 = inverseTableInterpolate(startAH, maximumHumidity).setDecimals(0) // Unneeded, but nice to know.
	return { T2, startAH, startAHmax, endRH, endAH, endAHmax }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'startAH')
		case 2:
			return performComparison(exerciseData, 'endAH')
		default:
			return performComparison(exerciseData, 'endRH')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

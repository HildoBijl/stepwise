const { tableInterpolate, inverseTableInterpolate } = require('../../../util')
const { maximumHumidity } = require('../../../data/moistureProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const { getCycle } = require('./support/aircoCycle')

const data = {
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
addSetupFromSteps(data)

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

	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax, dAH }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('startAH', input, solution, data.comparison)
		case 2:
			return performComparison('endAH', input, solution, data.comparison)
		case 3:
			return performComparison('T3', input, solution, data.comparison)
		case 4:
			return performComparison('dAH', input, solution, data.comparison)
		default:
			return performComparison(['T3', 'dAH'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

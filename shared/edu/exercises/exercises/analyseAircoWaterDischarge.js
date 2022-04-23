const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerRepeat } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')
const { tableInterpolate, inverseTableInterpolate } = require('../../../util/interpolation')
const { getCycle } = require('./support/aircoCycle')
const { maximumHumidity } = require('../../../data/moistureProperties')

const data = {
	skill: 'analyseAirco',
	setup: combinerRepeat('readMollierDiagram', 3),
	steps: ['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram', null],

	equalityOptions: {
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
			return performComparison('startAH', input, solution, data.equalityOptions)
		case 2:
			return performComparison('endAH', input, solution, data.equalityOptions)
		case 3:
			return performComparison('T3', input, solution, data.equalityOptions)
		case 4:
			return performComparison('dAH', input, solution, data.equalityOptions)
		default:
			return performComparison(['T3', 'dAH'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

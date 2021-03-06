const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
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

function getCorrect({ T1, startRH, T4, endRH }) {
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
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('startAH', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('endAH', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('T3', correct, input, data.equalityOptions)
		case 4:
			return checkParameter('dAH', correct, input, data.equalityOptions)
		default:
			return checkParameter(['T3', 'dAH'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

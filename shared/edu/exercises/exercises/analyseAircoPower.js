const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { air: { cp } } = require('../../../data/gasProperties')
const { performComparison } = require('../util/comparison')
const { tableInterpolate, inverseTableInterpolate } = require('../../../util/interpolation')
const { getCycle } = require('./support/aircoCycle')
const { maximumHumidity } = require('../../../data/moistureProperties')

const data = {
	setup: combinerAnd('analyseAirco', 'calculateSpecificHeatAndMechanicalWork', 'massFlowTrick'),
	steps: ['analyseAirco', 'calculateSpecificHeatAndMechanicalWork', 'massFlowTrick'],

	equalityOptions: {
		default: {
			relativeMargin: 0.05,
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
	const mdot = getRandomFloatUnit({
		min: 3,
		max: 15,
		unit: 'kg/s',
		significantDigits: 2,
	})
	return { T1, startRH, T4, endRH, mdot }
}

function getSolution({ T1, startRH, T4, endRH, mdot }) {
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

	// Heat flows.
	const qcool = cp.multiply(T1.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)
	const qheat = cp.multiply(T4.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)

	// Powers.
	const Pcool = mdot.multiply(qcool).setUnit('kW')
	const Pheat = mdot.multiply(qheat).setUnit('kW')

	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax, cp, qcool, qheat, mdot, Pcool, Pheat }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('T3', input, solution, data.equalityOptions)
		case 2:
			return performComparison(['qcool', 'qheat'], input, solution, data.equalityOptions)
		default:
			return performComparison(['Pcool', 'Pheat'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { tableInterpolate, inverseTableInterpolate } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { cp } } = require('../../../../../data/gasProperties')
const { maximumHumidity } = require('../../../../../data/moistureProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getCycle } = require('../tools')

const metaData = {
	steps: ['analyseAirco', 'calculateSpecificHeatAndMechanicalWork', 'massFlowTrick'],
	comparison: {
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
addSetupFromSteps(metaData)

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

	// Temperatures.
	const T2 = inverseTableInterpolate(startAH, maximumHumidity).setDecimals(0)
	const T3 = inverseTableInterpolate(endAH, maximumHumidity).setDecimals(0)

	// Heat flows.
	const qcool = cp.multiply(T1.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)
	const qheat = cp.multiply(T4.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)

	// Powers.
	const Pcool = mdot.multiply(qcool).setUnit('kW')
	const Pheat = mdot.multiply(qheat).setUnit('kW')

	return { T2, T3, startAH, startAHmax, endAH, endAHmax, cp, qcool, qheat, Pcool, Pheat }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'T3')
		case 2:
			return performComparison(exerciseData, ['qcool', 'qheat'])
		default:
			return performComparison(exerciseData, ['Pcool', 'Pheat'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

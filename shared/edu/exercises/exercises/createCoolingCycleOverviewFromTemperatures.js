const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const { getBasicCycle } = require('./support/fridgeCycle')
const refrigerantProperties = require('../../../data/refrigerantProperties')

const data = {
	skill: 'createCoolingCycleOverview',
	setup: combinerAnd('findFridgeTemperatures', combinerRepeat('determineRefrigerantProcess', 3)),
	steps: ['findFridgeTemperatures', 'determineRefrigerantProcess', 'determineRefrigerantProcess', 'determineRefrigerantProcess', null],

	equalityOptions: {
		default: {
			absoluteMargin: 4000, // J/kg*K.
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	let { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling } = getBasicCycle()
	TCold = TCold.setDecimals(0).roundToPrecision()
	TWarm = TWarm.setDecimals(0).roundToPrecision()
	dTCold = dTCold.setDecimals(0).roundToPrecision()
	dTWarm = dTWarm.setDecimals(0).roundToPrecision()
	dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
	dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
	return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling }
}

function getSolution({ refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling }) {
	// Get temperatures.
	const refrigerantData = refrigerantProperties[refrigerant]
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

	// Get pressures.
	const pEvap = refrigerantProperties.getBoilingPressure(TEvap, refrigerantData).setSignificantDigits(2)
	const pCond = refrigerantProperties.getBoilingPressure(TCond, refrigerantData).setSignificantDigits(2)

	// Get points.
	const point1 = refrigerantProperties.getProperties(pEvap, T1, refrigerantData)
	const point2 = refrigerantProperties.getProperties(pCond, point1.entropy, refrigerantData)
	const point3 = refrigerantProperties.getProperties(pCond, T3, refrigerantData)
	const point4 = refrigerantProperties.getProperties(pEvap, point3.enthalpy, refrigerantData)

	// Extract enthalpies.
	const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h4 = point4.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)

	// Return all data.
	return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, TEvap, TCond, pEvap, pCond, T1, T3, h1, h2, h3, h4, s1 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['TEvap', 'TCond'], input, solution, data.equalityOptions)
		case 2:
			return performComparison('h1', input, solution, data.equalityOptions)
		case 3:
			return performComparison('h2', input, solution, data.equalityOptions)
		case 4:
			return performComparison('h3', input, solution, data.equalityOptions)
		case 5:
			return performComparison('h4', input, solution, data.equalityOptions)
		default:
			return performComparison(['h1', 'h2', 'h3', 'h4'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

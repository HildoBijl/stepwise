const refrigerantProperties = require('../../../data/refrigerantProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const { getBasicCycle } = require('./support/fridgeCycle')

const data = {
	skill: 'createCoolingCycleOverview',
	steps: ['determineRefrigerantProcess', 'determineRefrigerantProcess', 'determineRefrigerantProcess', null],

	comparison: {
		default: {
			absoluteMargin: 4000, // J/kg*K.
			significantDigitMargin: 2,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	let { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling } = getBasicCycle()
	pEvap = pEvap.setUnit('bar').setSignificantDigits(2).roundToPrecision()
	pCond = pCond.setUnit('bar').setSignificantDigits(2).roundToPrecision()
	dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
	dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
	return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling }
}

function getSolution({ refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling }) {
	// Get temperatures.
	const refrigerantData = refrigerantProperties[refrigerant]
	const TEvap = refrigerantProperties.getBoilingTemperature(pEvap, refrigerantData).setDecimals(0)
	const TCond = refrigerantProperties.getBoilingTemperature(pCond, refrigerantData).setDecimals(0)
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

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
	return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, TEvap, TCond, T1, T3, h1, h2, h3, h4, s1 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('h1', input, solution, data.comparison)
		case 2:
			return performComparison('h2', input, solution, data.comparison)
		case 3:
			return performComparison('h3', input, solution, data.comparison)
		case 4:
			return performComparison('h4', input, solution, data.comparison)
		default:
			return performComparison(['h1', 'h2', 'h3', 'h4'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

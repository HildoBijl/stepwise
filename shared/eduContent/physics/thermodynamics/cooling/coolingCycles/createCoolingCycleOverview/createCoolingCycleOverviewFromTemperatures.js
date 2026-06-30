const { refrigerants, getBoilingPressure, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getRefrigerantPropertiesFromEntropy } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../../eduTools')

const { getBasicCycle } = require('../tools')

const metaData = {
	skill: 'createCoolingCycleOverview',
	steps: ['findFridgeTemperatures', 'determineRefrigerantProcess', 'determineRefrigerantProcess', 'determineRefrigerantProcess', null],
	comparison: {
		default: {
			float: {
				absoluteTolerance: 4000, // J/kg*K.
				significantDigitTolerance: 2,
			},
		},
		TEvap: {
			float: {
				absoluteTolerance: 1, // K
				significantDigitTolerance: 1,
			},
		},
		TCond: {
			float: {
				absoluteTolerance: 1, // K
				significantDigitTolerance: 1,
			},
		},
	},
}
addSetupFromSteps(metaData)

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
	const refrigerantData = refrigerants[refrigerant]
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

	// Get pressures.
	const pEvap = getBoilingPressure(refrigerantData, TEvap).setSignificantDigits(2)
	const pCond = getBoilingPressure(refrigerantData, TCond).setSignificantDigits(2)

	// Get points.
	const point1 = getRefrigerantPropertiesFromTemperature(refrigerantData, pEvap, T1)
	const point2 = getRefrigerantPropertiesFromEntropy(refrigerantData, pCond, point1.entropy)
	const point3 = getRefrigerantPropertiesFromTemperature(refrigerantData, pCond, T3)
	const point4 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pEvap, point3.enthalpy)

	// Extract enthalpies.
	const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h4 = point4.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)

	// Return all data.
	return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, TEvap, TCond, pEvap, pCond, T1, T3, h1, h2, h3, h4, s1 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['TEvap', 'TCond'])
		case 2:
			return performComparison(exerciseData, 'h1')
		case 3:
			return performComparison(exerciseData, 'h2')
		case 4:
			return performComparison(exerciseData, 'h3')
		case 5:
			return performComparison(exerciseData, 'h4')
		default:
			return performComparison(exerciseData, ['h1', 'h2', 'h3', 'h4'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

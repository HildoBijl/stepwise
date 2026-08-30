import { compareInputs } from '@step-wise/exercise-grading'
import { refrigerantDatasets, getSaturationPressure, getRefrigerantPropertiesFromPressureAndTemperature, getRefrigerantPropertiesFromPressureAndEnthalpy, getRefrigerantPropertiesFromPressureAndEntropy } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { getBasicCycle } from '../tools/index.ts'

export default buildStepExercise({
	metadata: {
		skill: 'createCoolingCycleOverview',
		...createStepExerciseMetadata(['findFridgeTemperatures', 'determineRefrigerantProcess', 'determineRefrigerantProcess', 'determineRefrigerantProcess', undefined]),
		comparisons: {
			Quantity: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			TEvap: { value: { absoluteTolerance: 1, significantDigitTolerance: 1 } },
			TCond: { value: { absoluteTolerance: 1, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		let { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling } = getBasicCycle()
		TCold = TCold.setDecimals(0).roundToPrecision()
		TWarm = TWarm.setDecimals(0).roundToPrecision()
		dTCold = dTCold.setDecimals(0).roundToPrecision()
		dTWarm = dTWarm.setDecimals(0).roundToPrecision()
		dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
		dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
		return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling }
	},

	getSolution({ refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling }) {
		const refrigerantData = refrigerantDatasets[refrigerant]
		const TEvap = TCold.subtract(dTCold)
		const TCond = TWarm.add(dTWarm)
		const T1 = TEvap.add(dTSuperheating)
		const T3 = TCond.subtract(dTSubcooling)
		const pEvap = getSaturationPressure(refrigerantData, TEvap)!.setSignificantDigits(2)
		const pCond = getSaturationPressure(refrigerantData, TCond)!.setSignificantDigits(2)
		const point1 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pEvap, T1)!
		const point2 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pCond, point1.entropy)!
		const point3 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, T3)!
		const point4 = getRefrigerantPropertiesFromPressureAndEnthalpy(refrigerantData, pEvap, point3.enthalpy)!
		const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h4 = point4.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)
		return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, TEvap, TCond, pEvap, pCond, T1, T3, h1, h2, h3, h4, s1 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['TEvap', 'TCond'], data)
			case 2: return compareInputs('h1', data)
			case 3: return compareInputs('h2', data)
			case 4: return compareInputs('h3', data)
			case 5: return compareInputs('h4', data)
			default: return compareInputs(['h1', 'h2', 'h3', 'h4'], data)
		}
	},
})

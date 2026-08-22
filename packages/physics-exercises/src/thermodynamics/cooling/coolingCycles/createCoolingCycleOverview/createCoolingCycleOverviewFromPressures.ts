import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { refrigerants, getBoilingTemperature, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getRefrigerantPropertiesFromEntropy } from '@step-wise/physics-data'

import { getBasicCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'createCoolingCycleOverview',
		...createStepExerciseMetadata(['determineRefrigerantProcess', 'determineRefrigerantProcess', 'determineRefrigerantProcess', undefined]),
		compare: { FloatUnit: { float: { absoluteTolerance: 4000, significantDigitTolerance: 2 } } },
	},

	generateParameters() {
		let { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling } = getBasicCycle()
		pEvap = pEvap.setUnit('bar').setSignificantDigits(2).roundToPrecision()
		pCond = pCond.setUnit('bar').setSignificantDigits(2).roundToPrecision()
		dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
		dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
		return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling }
	},

	getSolution({ refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling }) {
		const refrigerantData = refrigerants[refrigerant]
		const TEvap = getBoilingTemperature(refrigerantData, pEvap)!.setDecimals(0)
		const TCond = getBoilingTemperature(refrigerantData, pCond)!.setDecimals(0)
		const T1 = TEvap.add(dTSuperheating)
		const T3 = TCond.subtract(dTSubcooling)
		const point1 = getRefrigerantPropertiesFromTemperature(refrigerantData, pEvap, T1)!
		const point2 = getRefrigerantPropertiesFromEntropy(refrigerantData, pCond, point1.entropy)!
		const point3 = getRefrigerantPropertiesFromTemperature(refrigerantData, pCond, T3)!
		const point4 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pEvap, point3.enthalpy)!
		const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h4 = point4.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)
		return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, TEvap, TCond, T1, T3, h1, h2, h3, h4, s1 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('h1', data)
			case 2: return compare('h2', data)
			case 3: return compare('h3', data)
			case 4: return compare('h4', data)
			default: return compare(['h1', 'h2', 'h3', 'h4'], data)
		}
	},
})

import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { refrigerantDatasets, getSaturationTemperature, getRefrigerantPropertiesFromPressureAndTemperature, getRefrigerantPropertiesFromPressureAndEnthalpy, getRefrigerantPropertiesFromPressureAndEntropy } from '@step-wise/physics-data'

import { getBasicCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'createCoolingCycleOverview',
		...createStepExerciseMetadata(['determineRefrigerantProcess', 'determineRefrigerantProcess', 'determineRefrigerantProcess', undefined]),
		comparisons: { Quantity: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } } },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			let { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling } = getBasicCycle()
			pEvap = pEvap.setUnit('bar').setSignificantDigits(2).roundToPrecision()
			pCond = pCond.setUnit('bar').setSignificantDigits(2).roundToPrecision()
			dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
			dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()

			const refrigerantData = refrigerantDatasets[refrigerant]
			const TEvap = getSaturationTemperature(refrigerantData, pEvap)
			const TCond = getSaturationTemperature(refrigerantData, pCond)
			if (!TEvap || !TCond) continue
			const point1 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pEvap, TEvap.add(dTSuperheating))
			if (!point1) continue
			const point2 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pCond, point1.entropy)
			const point3 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, TCond.subtract(dTSubcooling))
			if (!point2 || !point3) continue
			const point4 = getRefrigerantPropertiesFromPressureAndEnthalpy(refrigerantData, pEvap, point3.enthalpy)
			if (!point4) continue
			return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling }
		}
		throw new Error('Failed to generate valid rounded cooling-cycle pressures after 100 attempts.')
	},

	getSolution({ refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling }) {
		const refrigerantData = refrigerantDatasets[refrigerant]
		const TEvap = getSaturationTemperature(refrigerantData, pEvap)!.setDecimals(0)
		const TCond = getSaturationTemperature(refrigerantData, pCond)!.setDecimals(0)
		const T1 = TEvap.add(dTSuperheating)
		const T3 = TCond.subtract(dTSubcooling)
		const point1 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pEvap, T1)!
		const point2 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pCond, point1.entropy)!
		const point3 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, T3)!
		const point4 = getRefrigerantPropertiesFromPressureAndEnthalpy(refrigerantData, pEvap, point3.enthalpy)!
		const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h4 = point4.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)
		return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, TEvap, TCond, T1, T3, h1, h2, h3, h4, s1 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('h1', data)
			case 2: return compareInputs('h2', data)
			case 3: return compareInputs('h3', data)
			case 4: return compareInputs('h4', data)
			default: return compareInputs(['h1', 'h2', 'h3', 'h4'], data)
		}
	},
})

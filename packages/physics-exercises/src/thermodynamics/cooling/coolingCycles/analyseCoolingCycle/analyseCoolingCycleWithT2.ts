import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { refrigerantDatasets, getSaturationTemperature, getRefrigerantPropertiesFromPressureAndTemperature, getRefrigerantPropertiesFromPressureAndEntropy } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'analyseCoolingCycle',
		...createStepExerciseMetadata(['createCoolingCycleOverview', ['calculateWithCOP', 'useIsentropicEfficiency', 'massFlowTrick']]),
		comparisons: {
			h1: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h2p: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h2: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h3: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h4: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			etai: { value: { absoluteTolerance: 0.04, significantDigitTolerance: 2 } },
			epsilon: { value: { absoluteTolerance: 0.4, relativeTolerance: 0.05, significantDigitTolerance: 2 } },
			COP: { value: { absoluteTolerance: 0.4, relativeTolerance: 0.05, significantDigitTolerance: 2 } },
			P: { value: { relativeTolerance: 0.1, significantDigitTolerance: 2 } },
		},
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			let { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, mdot, point2 } = getCycle()
			pEvap = pEvap.setUnit('bar').setSignificantDigits(2).roundToPrecision()
			pCond = pCond.setUnit('bar').setSignificantDigits(2).roundToPrecision()
			dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
			dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
			const T2 = point2.temperature.setDecimals(0).roundToPrecision()
			mdot = mdot.setUnit('g/s').setDecimals(0).roundToPrecision()

			const refrigerantData = refrigerantDatasets[refrigerant]
			const TEvap = getSaturationTemperature(refrigerantData, pEvap)
			const TCond = getSaturationTemperature(refrigerantData, pCond)
			if (!TEvap || !TCond) continue
			const point1 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pEvap, TEvap.add(dTSuperheating))
			if (!point1) continue
			const point2p = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pCond, point1.entropy)
			const checkedPoint2 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, T2)
			const point3 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, TCond.subtract(dTSubcooling))
			if (!point2p || !checkedPoint2 || !point3) continue
			return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, T2, mdot }
		}
		throw new Error('Failed to generate valid rounded cooling-cycle analysis parameters after 100 attempts.')
	},

	getSolution({ refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, T2, mdot }) {
		const refrigerantData = refrigerantDatasets[refrigerant]
		const TEvap = getSaturationTemperature(refrigerantData, pEvap)!.setDecimals(0)
		const TCond = getSaturationTemperature(refrigerantData, pCond)!.setDecimals(0)
		const T1 = TEvap.add(dTSuperheating)
		const T3 = TCond.subtract(dTSubcooling)
		const point1 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pEvap, T1)!
		const point2p = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pCond, point1.entropy)!
		const point2 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, T2)!
		const point3 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, T3)!
		const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h2p = point2p.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h4 = h3
		const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)
		const wtp = h2p.subtract(h1)
		const wt = h2.subtract(h1)
		const etai = wtp.divide(wt).setUnit('')
		const qin = h1.subtract(h4)
		const qout = h2.subtract(h3)
		const epsilon = qin.divide(wt).setUnit('')
		const COP = qout.divide(wt).setUnit('')
		mdot = mdot.setUnit('kg/s')
		const P = mdot.multiply(wt).setUnit('kW')
		return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, TEvap, TCond, T1, T2, T3, h1, h2, h2p, h3, h4, s1, wtp, wt, etai, qin, qout, epsilon, COP, mdot, P }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs(['h1', 'h2p', 'h2', 'h3', 'h4'], data)
			case 2:
				switch (substep) {
					case 1: return compareInputs(['epsilon', 'COP'], data)
					case 2: return compareInputs('etai', data)
					case 3: return compareInputs('P', data)
				}
			default: return compareInputs(['epsilon', 'COP', 'etai', 'P'], data)
		}
	},
})

import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { refrigerants, getBoilingPressure, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEntropy } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'analyseCoolingCycle',
		...createStepExerciseMetadata(['createCoolingCycleOverview', 'useIsentropicEfficiency', ['calculateWithCOP', 'massFlowTrick']]),
		compare: {
			h1: { float: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h2p: { float: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h2: { float: { absoluteTolerance: 6000, significantDigitTolerance: 2 } },
			h3: { float: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			h4: { float: { absoluteTolerance: 4000, significantDigitTolerance: 2 } },
			epsilon: { float: { absoluteTolerance: 0.4, relativeTolerance: 0.05, significantDigitTolerance: 2 } },
			COP: { float: { absoluteTolerance: 0.4, relativeTolerance: 0.05, significantDigitTolerance: 2 } },
			mdot: { float: { relativeTolerance: 0.1, significantDigitTolerance: 2 } },
		},
	},

	generateParameters() {
		let { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P } = getCycle()
		TCold = TCold.setDecimals(0).roundToPrecision()
		TWarm = TWarm.setDecimals(0).roundToPrecision()
		dTCold = dTCold.setDecimals(0).roundToPrecision()
		dTWarm = dTWarm.setDecimals(0).roundToPrecision()
		dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
		dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
		etai = etai.setDecimals(2).roundToPrecision()
		P = P.setUnit('kW').setSignificantDigits(2).roundToPrecision()
		return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P }
	},

	getSolution({ refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P }) {
		const refrigerantData = refrigerants[refrigerant]
		const TEvap = TCold.subtract(dTCold)
		const TCond = TWarm.add(dTWarm)
		const T1 = TEvap.add(dTSuperheating)
		const T3 = TCond.subtract(dTSubcooling)
		const pEvap = getBoilingPressure(refrigerantData, TEvap)!.setSignificantDigits(2)
		const pCond = getBoilingPressure(refrigerantData, TCond)!.setSignificantDigits(2)
		const point1 = getRefrigerantPropertiesFromTemperature(refrigerantData, pEvap, T1)!
		const point2p = getRefrigerantPropertiesFromEntropy(refrigerantData, pCond, point1.entropy)!
		const point3 = getRefrigerantPropertiesFromTemperature(refrigerantData, pCond, T3)!
		const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h2p = point2p.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
		const h4 = h3
		const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)
		const wtp = h2p.subtract(h1)
		const wt = wtp.divide(etai)
		const h2 = h1.add(wt)
		const qin = h1.subtract(h4)
		const qout = h2.subtract(h3)
		const epsilon = qin.divide(wt).setUnit('')
		const COP = qout.divide(wt).setUnit('')
		const mdot = P.divide(wt).setUnit('kg/s')
		return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, TEvap, TCond, pEvap, pCond, T1, T3, h1, h2, h2p, h3, h4, s1, wtp, wt, etai, qin, qout, epsilon, COP, mdot, P }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs(['h1', 'h2p', 'h3', 'h4'], data)
			case 2: return compareInputs('h2', data)
			case 3:
				switch (substep) {
					case 1: return compareInputs(['epsilon', 'COP'], data)
					case 2: return compareInputs('mdot', data)
				}
			default: return compareInputs(['epsilon', 'COP', 'mdot'], data)
		}
	},
})

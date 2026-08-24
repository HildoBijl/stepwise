import { interpolateTableOutputs } from '@step-wise/interpolation'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { saturatedSteamPropertiesByPressure, superheatedSteamProperties } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'createRankineCycleOverview',
		...createStepExerciseMetadata(['lookUpSteamProperties', undefined, 'lookUpSteamProperties', 'recognizeProcessTypes', 'useVaporFraction']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.002, significantDigitTolerance: 2 } } },
	},

	generateParameters() {
		let { pc, pe, T2 } = getCycle()
		pc = pc.setSignificantDigits(2).roundToPrecision()
		pe = pe.setDecimals(0).roundToPrecision()
		T2 = T2.setDecimals(0).roundToPrecision()
		return { pc, pe, T2 }
	},

	getSolution({ pc, pe, T2 }) {
		const saturatedProperties = interpolateTableOutputs(pc, saturatedSteamPropertiesByPressure)
		const hx0 = saturatedProperties.enthalpyLiquid!
		const hx1 = saturatedProperties.enthalpyVapor!
		const sx0 = saturatedProperties.entropyLiquid!
		const sx1 = saturatedProperties.entropyVapor!
		const h1 = hx0
		const s1 = sx0
		const h4 = h1
		const s4 = s1

		const superheatedProperties = interpolateTableOutputs([pe, T2], superheatedSteamProperties)
		const h2 = superheatedProperties.enthalpy!
		const s2 = superheatedProperties.entropy!

		const s3 = s2
		const x3 = s3.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
		const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))
		return { hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3, s3, x3, h4, s4 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('h4', data)
			case 2: return compareInputs('h1', data)
			case 3: return compareInputs(['h2', 's2'], data)
			case 4: return compareInputs('s3', data)
			case 5: return compareInputs('h3', data)
			default: return compareInputs(['h1', 'h2', 'h3', 'h4'], data)
		}
	},
})

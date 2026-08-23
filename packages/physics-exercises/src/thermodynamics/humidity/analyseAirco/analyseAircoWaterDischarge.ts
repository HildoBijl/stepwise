import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { maximumHumidity } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'analyseAirco',
		...createStepExerciseMetadata(['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram', undefined]),
		comparisons: {
			Quantity: { value: { absoluteTolerance: 0.001, significantDigitTolerance: 1 } },
			T3: { value: { absoluteTolerance: 1, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		let { T1, startRH, T4, endRH } = getCycle()
		T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
		T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
		startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
		endRH = endRH.setUnit('%').setDecimals(0).roundToPrecision()
		return { T1, startRH, T4, endRH }
	},

	getSolution({ T1, startRH, T4, endRH }) {
		startRH = startRH.simplify()
		endRH = endRH.simplify()
		const startAHmax = interpolateTable(T1, maximumHumidity)!.setSignificantDigits(2)
		const endAHmax = interpolateTable(T4, maximumHumidity)!.setSignificantDigits(2)
		const startAH = startRH.multiply(startAHmax).setDecimals(0)
		const endAH = endRH.multiply(endAHmax).setDecimals(0)
		const dAH = startAH.subtract(endAH)
		const T2 = interpolateTableInput(startAH, maximumHumidity)!.setDecimals(0)
		const T3 = interpolateTableInput(endAH, maximumHumidity)!.setDecimals(0)
		return { T2, T3, startAH, startAHmax, endAH, endAHmax, dAH }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('startAH', data)
			case 2: return compareInputs('endAH', data)
			case 3: return compareInputs('T3', data)
			case 4: return compareInputs('dAH', data)
			default: return compareInputs(['T3', 'dAH'], data)
		}
	},
})

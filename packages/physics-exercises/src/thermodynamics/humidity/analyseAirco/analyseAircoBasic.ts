import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { maximumHumidity } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metadata: {
		skill: 'analyseAirco',
		...createStepExerciseMetadata(['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram']),
		comparisons: {
			FloatUnit: { value: { absoluteTolerance: 0.001, significantDigitTolerance: 1 } },
			endRH: { value: { absoluteTolerance: 0.04, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		let { T1, T3, T4, startRH } = getCycle()
		T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
		T3 = T3.setDecimals(0).roundToPrecision().setDecimals(0)
		T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
		startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
		return { T1, T3, T4, startRH }
	},

	getSolution({ T1, T3, T4, startRH }) {
		startRH = startRH.simplify()
		const startAHmax = interpolateTable(T1, maximumHumidity)!.setSignificantDigits(2)
		const startAH = startRH.multiply(startAHmax)
		const endAH = interpolateTable(T3, maximumHumidity)!.setSignificantDigits(2)
		const endAHmax = interpolateTable(T4, maximumHumidity)!.setSignificantDigits(2)
		const endRH = endAH.divide(endAHmax).setUnit('')
		const T2 = interpolateTableInput(startAH, maximumHumidity)!.setDecimals(0)
		return { T2, startAH, startAHmax, endRH, endAH, endAHmax }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('startAH', data)
			case 2: return compareInputs('endAH', data)
			default: return compareInputs('endRH', data)
		}
	},
})

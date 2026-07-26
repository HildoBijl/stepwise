import { tableInterpolate, inverseTableInterpolate } from '@step-wise/interpolation'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { maximumHumidity } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metaData: {
		skill: 'analyseAirco',
		...stepsToSetup(['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram']),
		compare: {
			FloatUnit: { float: { absoluteTolerance: 0.001, significantDigitTolerance: 1 } },
			endRH: { float: { absoluteTolerance: 0.04, significantDigitTolerance: 1 } },
		},
	},

	generateState() {
		let { T1, T3, T4, startRH } = getCycle()
		T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
		T3 = T3.setDecimals(0).roundToPrecision().setDecimals(0)
		T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
		startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
		return { T1, T3, T4, startRH }
	},

	getSolution({ T1, T3, T4, startRH }) {
		startRH = startRH.simplify()
		const startAHmax = tableInterpolate(T1, maximumHumidity)!.setSignificantDigits(2)
		const startAH = startRH.multiply(startAHmax)
		const endAH = tableInterpolate(T3, maximumHumidity)!.setSignificantDigits(2)
		const endAHmax = tableInterpolate(T4, maximumHumidity)!.setSignificantDigits(2)
		const endRH = endAH.divide(endAHmax).setUnit('')
		const T2 = inverseTableInterpolate(startAH, maximumHumidity)!.setDecimals(0)
		return { T2, startAH, startAHmax, endRH, endAH, endAHmax }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('startAH', data)
			case 2: return compare('endAH', data)
			default: return compare('endRH', data)
		}
	},
})

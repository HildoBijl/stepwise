import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties, maximumHumidity } from '@step-wise/physics-data'

import { getCycle } from '../tools'

const { cp } = gasProperties.air

export default buildStepExercise({
	metadata: {
		...createStepExerciseMetadata(['analyseAirco', 'calculateSpecificHeatAndMechanicalWork', 'massFlowTrick']),
		comparisons: {
			FloatUnit: { value: { relativeTolerance: 0.05, significantDigitTolerance: 1 } },
			T3: { value: { absoluteTolerance: 1, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		let { T1, startRH, T4, endRH } = getCycle()
		T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
		T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
		startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
		endRH = endRH.setUnit('%').setDecimals(0).roundToPrecision()
		const mdot = getRandomFloatUnit({ min: 3, max: 15, unit: 'kg/s', significantDigits: 2 })
		return { T1, startRH, T4, endRH, mdot }
	},

	getSolution({ T1, startRH, T4, endRH, mdot }) {
		startRH = startRH.simplify()
		endRH = endRH.simplify()
		const startAHmax = interpolateTable(T1, maximumHumidity)!.setSignificantDigits(2)
		const endAHmax = interpolateTable(T4, maximumHumidity)!.setSignificantDigits(2)
		const startAH = startRH.multiply(startAHmax).setDecimals(0)
		const endAH = endRH.multiply(endAHmax).setDecimals(0)
		const T2 = interpolateTableInput(startAH, maximumHumidity)!.setDecimals(0)
		const T3 = interpolateTableInput(endAH, maximumHumidity)!.setDecimals(0)
		const qcool = cp.multiply(T1.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)
		const qheat = cp.multiply(T4.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)
		const Pcool = mdot.multiply(qcool).setUnit('kW')
		const Pheat = mdot.multiply(qheat).setUnit('kW')
		return { T2, T3, startAH, startAHmax, endAH, endAHmax, cp, qcool, qheat, Pcool, Pheat }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('T3', data)
			case 2: return compareInputs(['qcool', 'qheat'], data)
			default: return compareInputs(['Pcool', 'Pheat'], data)
		}
	},
})

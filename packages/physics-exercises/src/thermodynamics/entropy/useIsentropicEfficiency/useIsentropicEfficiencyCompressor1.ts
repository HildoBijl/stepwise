import { compareInputs } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { getCycle } from '../../gasTurbines/tools/index.ts'

const { k, cp } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'useIsentropicEfficiency',
		...createStepExerciseMetadata(['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		let { p1, T1, p2, etai } = getCycle()
		p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
		p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
		T1 = T1.setDecimals(0).roundToPrecision()
		const T2p = T1.multiply(Math.pow(p2.number / p1.number, 1 - 1 / k.number))
		const T2 = T1.add(T2p.subtract(T1).divide(etai)).setDecimals(0).roundToPrecision()
		return { p1, p2, T1, T2 }
	},

	getSolution({ p1, p2, T1, T2 }) {
		const T2p = T1.multiply(p2.divide(p1).value.toPower(1 - 1 / k.number)).setDecimals(0)
		const wt = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
		const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
		const etai = wti.divide(wt).setUnit('')
		return { k, cp, T2p, wt, wti, etai }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('T2p', data)
			case 2: return compareInputs(['wt', 'wti'], data)
			default: return compareInputs('etai', data)
		}
	},
})

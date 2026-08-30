import { compareInputs } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { getCycle } from '../../gasTurbines/tools/index.ts'

const { k, cp } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'useIsentropicEfficiency',
		...createStepExerciseMetadata(['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation', 'calculateSpecificHeatAndMechanicalWork']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		let { p1, T1, p2, etai: etaio } = getCycle()
		p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
		p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
		T1 = T1.setDecimals(0).roundToPrecision()
		etaio = etaio.setUnit('%').setDecimals(0).roundToPrecision()
		return { p1, p2, T1, etaio }
	},

	getSolution({ p1, p2, T1, etaio }) {
		const etai = etaio.simplify()
		const T2p = T1.multiply(p2.divide(p1).value.toPower(1 - 1 / k.number)).setDecimals(0)
		const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
		const wt = wti.divide(etai).setUnit('J/kg')
		const T2 = T1.add(wt.divide(cp)).setUnit('K').setDecimals(0)
		return { k, cp, etai, T2p, wti, wt, T2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('T2p', data)
			case 2: return compareInputs('wti', data)
			case 3: return compareInputs('wt', data)
			default: return compareInputs('T2', data)
		}
	},
})

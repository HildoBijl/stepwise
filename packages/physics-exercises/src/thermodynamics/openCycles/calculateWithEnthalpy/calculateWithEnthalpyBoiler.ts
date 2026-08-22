import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'

import { generateParameters } from '../calculateWithSpecificQuantities/calculateWithSpecificQuantitiesBoiler'

export default buildStepExercise({
	metaData: {
		skill: 'calculateWithEnthalpy',
		...createStepExerciseMetadata(['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters,

	getSolution({ Q, m }) {
		const Qs = Q.simplify()
		const q = Qs.divide(m).setUnit('kJ/kg')
		const c = new FloatUnit('4186 J/kg * dC')
		const dT = q.divide(c).simplify()
		const wt = new FloatUnit('0 kJ/kg')
		const dh = q.subtract(wt)
		return { Qs, q, c, dT, wt, dh }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('q', data)
			case 2: return compare('wt', data)
			default: return compare('dh', data)
		}
	},
})

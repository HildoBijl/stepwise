import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'

import { generateParameters } from '../calculateWithSpecificQuantities/calculateWithSpecificQuantitiesBoiler'

export default buildStepExercise({
	metadata: {
		skill: 'calculateWithEnthalpy',
		...createStepExerciseMetadata(['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
		comparisons: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
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
			case 1: return compareInputs('q', data)
			case 2: return compareInputs('wt', data)
			default: return compareInputs('dh', data)
		}
	},
})

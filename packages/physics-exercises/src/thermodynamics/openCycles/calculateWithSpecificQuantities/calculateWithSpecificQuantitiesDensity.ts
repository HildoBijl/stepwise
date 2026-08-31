import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

import { buildMonoExercise } from '#physicsExerciseBuilding'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithSpecificQuantities',
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const rho = getRandomQuantity({ min: 0.4, max: 1.2, unit: 'kg/m^3', significantDigits: 2 })
		return { rho }
	},

	getSolution({ rho }) {
		return { v: rho.invert() }
	},

	checkInput(data) {
		return compareInputs('v', data)
	},
})

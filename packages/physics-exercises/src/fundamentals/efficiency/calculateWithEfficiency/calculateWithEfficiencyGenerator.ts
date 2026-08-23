import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithEfficiency',
		comparisons: { Quantity: { value: { significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const P = getRandomQuantity({
			min: 2.5,
			max: 20,
			significantDigits: 2,
			unit: 'kW',
		})
		const eta = getRandomQuantity({
			min: 0.10,
			max: 0.30,
			significantDigits: 2,
			unit: '',
		})
		const Pin = P.divide(eta).roundToPrecision()

		return { P, Pin }
	},

	getSolution({ P, Pin }) {
		return { eta: P.divide(Pin).setUnit('') }
	},

	checkInput(data) {
		return compareInputs('eta', data)
	},
})

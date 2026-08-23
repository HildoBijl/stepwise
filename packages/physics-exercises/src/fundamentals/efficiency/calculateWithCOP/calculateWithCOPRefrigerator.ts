import { randomNumber } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithCOP',
		comparisons: { Quantity: { value: { significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const Ee = getRandomQuantity({
			min: 3,
			max: 8,
			significantDigits: 2,
			unit: 'MJ',
		})
		const epsilon = randomNumber(2, 4)
		const Eout = Ee.multiply(epsilon + 1).roundToPrecision()

		return { Ee, Eout }
	},

	getSolution({ Ee, Eout }) {
		return {
			Ef: Eout.subtract(Ee, true),
			epsilon: Eout.subtract(Ee).divide(Ee).setUnit('').setSignificantDigits(2),
		}
	},

	checkInput(data) {
		return compareInputs('epsilon', data)
	},
})

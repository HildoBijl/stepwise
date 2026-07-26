import { getRandomNumber } from '@step-wise/utils'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithCOP',
		compare: { FloatUnit: { float: { significantDigitTolerance: 1 } } },
	},

	generateState() {
		const Ee = getRandomFloatUnit({
			min: 3,
			max: 8,
			significantDigits: 2,
			unit: 'MJ',
		})
		const epsilon = getRandomNumber(2, 4)
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
		return compare('epsilon', data)
	},
})

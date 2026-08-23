import { randomNumber } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithCOP',
		compare: { FloatUnit: { float: { significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const Pe = getRandomFloatUnit({
			min: 8,
			max: 15,
			significantDigits: 2,
			unit: 'kW',
		})
		const COP = randomNumber(3, 5)
		const Pin = Pe.multiply(COP - 1).roundToPrecision()

		return { Pe, Pin }
	},

	getSolution({ Pe, Pin }) {
		return {
			Pout: Pin.add(Pe, true),
			COP: Pin.add(Pe).divide(Pe).setUnit('').setSignificantDigits(2),
		}
	},

	checkInput(data) {
		return compareInputs('COP', data)
	},
})

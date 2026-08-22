import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithEfficiency',
		compare: { FloatUnit: { float: { significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const P = getRandomFloatUnit({
			min: 2.5,
			max: 20,
			significantDigits: 2,
			unit: 'kW',
		})
		const eta = getRandomFloatUnit({
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
		return compare('eta', data)
	},
})

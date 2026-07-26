import { getRandomFloatUnit } from '@step-wise/physics-core'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithEfficiency',
		compare: { FloatUnit: { float: { significantDigitTolerance: 1 } } },
	},

	generateState() {
		const E = getRandomFloatUnit({
			min: 15,
			max: 60,
			decimals: 0,
			unit: 'kWh',
		}).setSignificantDigits(3).roundToPrecision()
		const eta = getRandomFloatUnit({
			min: 0.915,
			max: 0.995,
			significantDigits: 3,
			unit: '',
		})
		const Ein = E.divide(eta).roundToPrecision()

		return { E, Ein }
	},

	getSolution({ E, Ein }) {
		return { eta: E.divide(Ein).setUnit('') }
	},

	checkInput(data) {
		return compare('eta', data)
	},
})

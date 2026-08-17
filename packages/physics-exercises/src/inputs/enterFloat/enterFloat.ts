import { getRandomInteger } from '@step-wise/js-utils'
import { getRandomExponentialFloat } from '@step-wise/physics-core'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

function generateState(example: boolean) {
	const x = getRandomExponentialFloat({ min: example ? 1e-4 : 1e-8, max: example ? 1e5 : 1e9, randomSign: true, significantDigits: getRandomInteger(2, example ? 2 : 4) })
	if (x.getDisplayPower() === 0) return generateState(example)
	return { x }
}

export default buildSimpleExercise({
	metaData: {
		skill: 'enterFloat',
		compare: {
			ans: { significantDigitTolerance: 0, checkPower: true },
		},
	},

	generateState,

	getSolution({ x }) {
		return { ans: x }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})

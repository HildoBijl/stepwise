import { randomInteger } from '@step-wise/js-utils'
import { getRandomExponentialFloat } from '@step-wise/physics-core'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

function generateParameters(example: boolean) {
	const x = getRandomExponentialFloat({ min: example ? 1e-4 : 1e-8, max: example ? 1e5 : 1e9, randomSign: true, significantDigits: randomInteger(2, example ? 2 : 4) })
	if (x.getDisplayPower() === 0) return generateParameters(example)
	return { x }
}

export default buildMonoExercise({
	metadata: {
		skill: 'enterFloat',
		compare: {
			ans: { significantDigitTolerance: 0, checkPower: true },
		},
	},

	generateParameters,

	getSolution({ x }) {
		return { ans: x }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})

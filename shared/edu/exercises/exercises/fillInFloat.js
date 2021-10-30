import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomExponentialFloat } from '../../../inputTypes/Float'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'fillInFloat',
	equalityOptions: { relativeMargin: 0.0001 },
}

export function generateState() {
	return {
		x: getRandomExponentialFloat({
			min: 1e-6,
			max: 1e7,
			randomSign: true,
			significantDigits: getRandomInteger(2, 4),
		})
	}
}

export function checkInput({ x }, { ans }) {
	return x.equals(ans, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)

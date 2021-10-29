import { getRandomInteger } from '../../../inputTypes/Integer'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'

export const data = {
	skill: 'summationAndMultiplication',
	setup: combinerAnd('multiplication', 'summation'),
	steps: ['multiplication', 'summation'],
}

export function generateState() {
	return {
		a: getRandomInteger(1, 10),
		b: getRandomInteger(1, 10),
		c: getRandomInteger(1, 100),
	}
}

export function checkInput({ a, b, c }, { ans, ab }, step) {
	if (step === 0)
		return a * b + c === ans
	if (step === 1)
		return a * b === ab
	if (step === 2)
		return a * b + c === ans
}

export default {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
}

const { getRandomInteger } = require('../util/inputTypes/Integer')
const { getStepExerciseProcessor } = require('../util/exercises/stepExercise')

const data = {
	skill: 'summationAndMultiplication',
	setup: { type: 'and', skills: [{ type: 'repeat', times: 2, skill: 'multiplication' }, 'summation'] },
	steps: ['multiplication', 'multiplication', 'summation'],
}

function generateState() {
	return {
		a: getRandomInteger(1, 10),
		b: getRandomInteger(1, 10),
		c: getRandomInteger(1, 10),
		d: getRandomInteger(1, 10),
	}
}

function checkInput({ a, b, c, d }, { p1, p2, ans }, step) {
	if (!step || step === 3)
		return a * b + c * d === ans
	if (step === 1)
		return a * b === p1
	if (step === 2)
		return c * d === p2
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
}

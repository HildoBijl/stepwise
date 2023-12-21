const { getRandomInteger } = require('../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../../eduTools')

const data = {
	skill: 'summationAndMultiplication',
	steps: ['multiplication', 'summation'],
}
addSetupFromSteps(data)

function generateState() {
	return {
		a: getRandomInteger(1, 10),
		b: getRandomInteger(1, 10),
		c: getRandomInteger(1, 100),
	}
}

function checkInput({ a, b, c }, { ans, ab }, step) {
	if (step === 0)
		return a * b + c === ans
	if (step === 1)
		return a * b === ab
	if (step === 2)
		return a * b + c === ans
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
}
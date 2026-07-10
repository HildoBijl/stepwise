const { getRandomInteger } = require('@step-wise/utils')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'summationAndMultiplication',
	...stepsToSetup([undefined, 'multiplication', 'summation']),
}

function generateState(example) {
	return {
		a: getRandomInteger(2, example ? 6 : 10),
		b: getRandomInteger(2, example ? 6 : 10),
		c: getRandomInteger(8, example ? 30 : 100),
	}
}

function getSolution({ a, b, c }) {
	return {
		order: 1,
		ab: a * b,
		ans: a * b + c,
	}
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('order', data)
		case 2:
			return compare('ab', data)
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

const { getRandomInteger } = require('@step-wise/utils')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../eduTools')

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

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'order')
		case 2:
			return performComparison(exerciseData, 'ab')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

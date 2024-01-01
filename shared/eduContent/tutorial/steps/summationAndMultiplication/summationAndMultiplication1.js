const { getRandomInteger } = require('../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'summationAndMultiplication',
	steps: ['multiplication', 'summation'],
}
addSetupFromSteps(metaData)

function generateState() {
	return {
		a: getRandomInteger(1, 10),
		b: getRandomInteger(1, 10),
		c: getRandomInteger(1, 100),
	}
}

function getSolution({ a, b, c }) {
	return {
		ab: a * b,
		ans: a * b + c,
	}
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'ab')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

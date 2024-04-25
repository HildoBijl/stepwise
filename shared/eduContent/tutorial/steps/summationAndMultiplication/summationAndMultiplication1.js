const { getRandomInteger } = require('../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'summationAndMultiplication',
	steps: [null, 'multiplication', 'summation'],
}
addSetupFromSteps(metaData)

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

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

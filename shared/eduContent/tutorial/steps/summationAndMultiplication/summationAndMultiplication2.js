const { getRandomInteger } = require('../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'summationAndMultiplication',
	steps: ['multiplication', 'multiplication', 'summation'],
	weight: 2, // This exercise has more variation so can count as two separate copies of this exercise.
}
addSetupFromSteps(metaData)

function generateState() {
	return {
		a: getRandomInteger(1, 10),
		b: getRandomInteger(1, 10),
		c: getRandomInteger(1, 10),
		d: getRandomInteger(1, 10),
	}
}

function getSolution({ a, b, c, d }) {
	const ab = a * b
	const cd = c * d
	const ans = ab + cd
	return { ab, cd, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'ab')
		case 2:
			return performComparison(exerciseData, 'cd')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

const { getRandomInteger } = require('../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'summationAndMultiplication',
	steps: [null, ['multiplication', 'multiplication'], 'summation'],
	weight: 2, // This exercise has more variation so can count as two separate copies of this exercise.
}
addSetupFromSteps(metaData)

function generateState(example) {
	return {
		a: getRandomInteger(2, example ? 6 : 10),
		b: getRandomInteger(2, example ? 6 : 10),
		c: getRandomInteger(2, example ? 6 : 10),
		d: getRandomInteger(2, example ? 6 : 10),
	}
}

function getSolution({ a, b, c, d }) {
	const order = 1
	const ab = a * b
	const cd = c * d
	const ans = ab + cd
	return { order, ab, cd, ans }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'order')
		case 2:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'ab')
				case 2:
					return performComparison(exerciseData, 'cd')
			}
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

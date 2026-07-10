const { getRandomInteger } = require('@step-wise/utils')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'summationAndMultiplication',
	...stepsToSetup([undefined, ['multiplication', 'multiplication'], 'summation']),
	weight: 2, // This exercise has more variation so can count as two separate copies of this exercise.
}

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

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			return compare('order', data)
		case 2:
			switch (substep) {
				case 1:
					return compare('ab', data)
				case 2:
					return compare('cd', data)
			}
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

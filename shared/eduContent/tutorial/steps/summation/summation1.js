const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'summation',
}

function generateState(example) {
	return {
		a: getRandomInteger(8, example ? 30 : 100),
		b: getRandomInteger(8, example ? 30 : 100),
	}
}

function getSolution({ a, b }) {
	return { ans: a + b }
}

function checkInput(data) {
	return compare('ans', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../eduTools')

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

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

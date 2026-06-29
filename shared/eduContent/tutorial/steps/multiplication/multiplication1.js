const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'multiplication',
}

function generateState(example) {
	return {
		a: getRandomInteger(2, example ? 6 : 10),
		b: getRandomInteger(2, example ? 6 : 10),
	}
}

function getSolution({ a, b }) {
	return { ans: a*b }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

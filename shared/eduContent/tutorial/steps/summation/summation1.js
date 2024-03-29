const { getRandomInteger } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'summation',
}

function generateState() {
	return {
		a: getRandomInteger(1, 100),
		b: getRandomInteger(1, 100),
	}
}

function getSolution({ a, b }) {
	return { ans: a + b }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

const { getRandomInteger } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

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

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

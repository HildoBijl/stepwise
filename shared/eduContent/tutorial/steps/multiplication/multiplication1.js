const { getRandomInteger } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'multiplication',
}

function generateState() {
	return {
		a: getRandomInteger(1, 10),
		b: getRandomInteger(1, 10),
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

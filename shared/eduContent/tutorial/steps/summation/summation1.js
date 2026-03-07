const { randomInteger } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'summation',
}

function generateState(example) {
	return {
		a: randomInteger(8, example ? 30 : 100),
		b: randomInteger(8, example ? 30 : 100),
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

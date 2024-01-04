const { getRandomInteger } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'recognizeProcessTypes',
}

function generateState() {
	return {
		type: getRandomInteger(0, 4),
	}
}

function getSolution({ type }) {
	return { ans: type }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

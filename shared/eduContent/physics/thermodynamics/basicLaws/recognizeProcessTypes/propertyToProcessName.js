const { getRandomInteger } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, getMultipleChoiceMapping, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'recognizeProcessTypes',
}

function generateState() {
	const numChoices = 5
	const type = getRandomInteger(0, numChoices - 1)
	return {
		type,
		mapping: getMultipleChoiceMapping({ numChoices, pick: 4, include: type, randomOrder: true }),
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

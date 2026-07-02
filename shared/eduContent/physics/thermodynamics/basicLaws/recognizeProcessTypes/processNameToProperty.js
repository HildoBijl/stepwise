const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise, getMultipleChoiceMapping } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'recognizeProcessTypes',
}

function generateState() {
	const numChoices = 6
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

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

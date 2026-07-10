const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise, getMultipleChoiceMapping } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

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

function checkInput(data) {
	return compare('ans', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

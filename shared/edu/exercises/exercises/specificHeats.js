const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'specificHeats',
	equalityOptions: {
		relativeMargin: 0.02, // Increase the margin to allow for errors.
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'carbonDioxide', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) } // Skip a few gases that have too much variation in their values across books.
}

function checkInput({ medium }, input) {
	return gasProperties[medium].cv.equals(input.cv, data.equalityOptions) && gasProperties[medium].cp.equals(input.cp, data.equalityOptions)
}

function getCorrect({ medium }) {
	return gasProperties[medium]
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
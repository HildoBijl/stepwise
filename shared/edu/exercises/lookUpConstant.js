const { selectRandomly } = require('../../util/random')
const { getSimpleExerciseProcessor } = require('../util/exercises/simpleExercise')
const constants = require('../util/constants')

const data = {
	// ToDo: add data on difficulty.
	equalityOptions: {
		relativeMargin: 0.0001,
	}
}

function generateState() {
	return { constant: selectRandomly(['c', 'g', 'R', 'e', 'k', 'G']) }
}

function checkInput({ constant }, { ans }) {
	return constants[constant].equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
	checkInput,
}
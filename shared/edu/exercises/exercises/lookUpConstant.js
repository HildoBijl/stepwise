const { selectRandomly } = require('../../../util/random')
const constants = require('../../../inputTypes/constants')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'lookUpConstant',
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
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
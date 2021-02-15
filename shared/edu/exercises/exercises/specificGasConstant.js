const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'specificGasConstant',
	equalityOptions: {
		relativeMargin: 0.015,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('Rs', correct, input, data.equalityOptions)
}

function getCorrect({ medium }) {
	return gasProperties[medium].Rs
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
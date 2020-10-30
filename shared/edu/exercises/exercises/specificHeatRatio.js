const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'specificHeatRatio',
	equalityOptions: {
		relativeMargin: 0.01,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonDioxide', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

function getCorrect({ medium }) {
	return gasProperties[medium].k
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
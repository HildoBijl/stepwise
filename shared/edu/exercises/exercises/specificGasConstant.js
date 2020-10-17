const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'specificGasConstant',
	equalityOptions: {
		relativeMargin: 0.01,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonDioxide', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput({ medium }, { ans }) {
	return gasProperties[medium].Rs.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
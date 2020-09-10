const { selectRandomly } = require('../../../util/random')
const specificGasConstants = require('../../../data/specificGasConstants')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'specificGasConstant',
	equalityOptions: {
		relativeMargin: 0.01,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'carbonDioxide', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput({ medium }, { ans }) {
	return specificGasConstants[medium].equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
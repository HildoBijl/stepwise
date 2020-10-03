const { selectRandomly } = require('../../../util/random')
const specificHeatRatios = require('../../../data/specificHeatRatios')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'specificHeatRatios',
	equalityOptions: {
		relativeMargin: 0.01,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonDioxide', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput({ medium }, { ans }) {
	return specificHeatRatios[medium].equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
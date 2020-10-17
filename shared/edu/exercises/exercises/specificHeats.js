const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'specificHeats',
	equalityOptions: {
		relativeMargin: 0.01,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'carbonDioxide', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) } // Skip a few gases that have too much variation in their values across books.
}

function checkInput({ medium }, { anscv, anscp }) {
	return gasProperties[medium].cv.equals(anscv, data.equalityOptions), gasProperties[medium].cp.equals(anscp, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
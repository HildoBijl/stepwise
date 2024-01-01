const { selectRandomly } = require('../../../../util')
const constants = require('../../../../data/constants')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'lookUpConstant',
	comparison: { ans: { relativeMargin: 0.0001 } },
}

function generateState() {
	return { constant: selectRandomly(['c', 'g', 'R', 'e', 'k', 'G']) }
}

function getSolution({ constant }) {
	return { ans: constants[constant] }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

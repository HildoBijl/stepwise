const { sample } = require('@step-wise/utils')
const { c, g, R, e, k, G } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../eduTools')

const constants = { c, g, R, e, k, G }

const metaData = {
	skill: 'lookUpConstant',
	comparison: { ans: { float: { relativeTolerance: 0.0001 } } },
}

function generateState(example) {
	return { constant: sample(example ? ['c', 'g', 'R'] : ['c', 'g', 'R', 'e', 'k', 'G']) }
}

function getSolution({ constant }) {
	return { ans: constants[constant] }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

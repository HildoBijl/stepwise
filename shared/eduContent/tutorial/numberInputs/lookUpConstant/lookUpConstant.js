const { sample } = require('@step-wise/utils')
const { c, g, R, e, k, G } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const constants = { c, g, R, e, k, G }

const metaData = {
	skill: 'lookUpConstant',
	compare: { ans: { float: { relativeTolerance: 0.0001 } } },
}

function generateState(example) {
	return { constant: sample(example ? ['c', 'g', 'R'] : ['c', 'g', 'R', 'e', 'k', 'G']) }
}

function getSolution({ constant }) {
	return { ans: constants[constant] }
}

function checkInput(data) {
	return compare('ans', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

const { getRandomInteger } = require('../../../inputTypes/Integer')
const { asExpression, expressionComparisons } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'demo',
	comparison: expressionComparisons.onlyOrderChanges,
}

function generateState() {
	return {
		x: getRandomInteger(2, 6),
	}
}

function getSolution(state) {
	return { ...state, ans: asExpression(`sin(${state.x}x)`) }
}

function checkInput(state, input) {
	return performComparison('ans', input, getSolution(state), data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

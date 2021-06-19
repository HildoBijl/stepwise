const { getRandomInteger } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'fillInExpression',
	equalityOptions: {
		// TODO
	},
}

const expressions = [
	'a\\cdot b+c \\pm 2 \\mp 3',
	// 'a\\left(b+c\\right)',
	// '\\log(x^2)',
	// ToDo: eventually add all use cases here.
]

function generateState() {
	return { index: getRandomInteger(0, expressions.length - 1) }
}

function getCorrect({ index }) {
	return expressions[index]
}

function checkInput(state, { ans }) {
	const correct = getCorrect(state)
	return correct.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	expressions,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
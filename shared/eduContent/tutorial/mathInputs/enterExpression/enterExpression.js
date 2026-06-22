const { sample, getRandomInteger } = require('@step-wise/utils')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { getSimpleExerciseProcessor, selectRandomVariables, performComparison } = require('../../../../eduTools')

const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']

const metaData = {
	skill: 'enterExpression',
	comparison: { ans: (input, correct) => expressionComparisons.exactEqual(input.flatten(['mergeProductMinuses']), correct.flatten(['mergeProductMinuses'])) },
}

function generateState() {
	const variableSet = sample(availableVariableSets)
	const variables = selectRandomVariables(variableSet, usedVariables)
	return {
		expression: sample([
			asExpression(`(${getRandomInteger(-12, 12, [0])}-x)/(y+${getRandomInteger(-12, 12, [0])})`), // Fractions.
			asExpression(`${getRandomInteger(-12, 12, [0])}${variables.x}_${getRandomInteger(1, 3)}^${getRandomInteger(2, 4)} + ${getRandomInteger(-12, 12, [0])}${variables.y}_${getRandomInteger(2, 4)}^${getRandomInteger(1, 3)}`), // Powers/subscripts.
			asExpression(`${getRandomInteger(-12, 12, [0])}*hat(${variables.x})_${getRandomInteger(1, 3)} + ${getRandomInteger(-12, 12, [0])}*dot(${variables.y})^${getRandomInteger(2, 4)}`), // Accents with powers.
			asExpression(`(${getRandomInteger(-12, 12, [0])}-x)^(y/${getRandomInteger(2, 6)})`), // Brackets and powers with fractions.
			asExpression(`${sample(['sin', 'cos', 'tan'])}(${getRandomInteger(-4, 4, [0, 1])}*${sample(['asin', 'acos', 'atan'])}(x/y))`), // Trigonometric functions.
			asExpression(`root[x](${getRandomInteger(-12, 12, [0])}+y)`), // Roots.
			asExpression(`log[x](${getRandomInteger(-12, 12, [0])}y)`), // Logarithms.
		]).combine().substitute(variables)
	}
}

function getSolution({ expression }) {
	return { ans: expression }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

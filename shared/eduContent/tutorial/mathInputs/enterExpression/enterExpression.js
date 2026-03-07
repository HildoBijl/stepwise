const { sample, randomInteger } = require('../../../../util')
const { asExpression, expressionComparisons } = require('../../../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, performComparison } = require('../../../../eduTools')

const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']

const metaData = {
	skill: 'enterExpression',
	comparison: { ans: expressionComparisons.exactEqual },
}

function generateState() {
	const variableSet = sample(availableVariableSets)
	const variables = selectRandomVariables(variableSet, usedVariables)
	return {
		expression: sample([
			asExpression(`(${randomInteger(-12, 12, [0])}-x)/(y+${randomInteger(-12, 12, [0])})`), // Fractions.
			asExpression(`${randomInteger(-12, 12, [0])}${variables.x}_${randomInteger(1, 3)}^${randomInteger(2, 4)} + ${randomInteger(-12, 12, [0])}${variables.y}_${randomInteger(2, 4)}^${randomInteger(1, 3)}`), // Powers/subscripts.
			asExpression(`${randomInteger(-12, 12, [0])}*hat(${variables.x})_${randomInteger(1, 3)} + ${randomInteger(-12, 12, [0])}*dot(${variables.y})^${randomInteger(2, 4)}`), // Accents with powers.
			asExpression(`(${randomInteger(-12, 12, [0])}-x)^(y/${randomInteger(2, 6)})`), // Brackets and powers with fractions.
			asExpression(`${sample(['sin', 'cos', 'tan'])}(${randomInteger(-4, 4, [0, 1])}*${sample(['asin', 'acos', 'atan'])}(x/y))`), // Trigonometric functions.
			asExpression(`root[x](${randomInteger(-12, 12, [0])}+y)`), // Roots.
			asExpression(`log[x](${randomInteger(-12, 12, [0])}y)`), // Logarithms.
		]).regularClean().substituteVariables(variables)
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

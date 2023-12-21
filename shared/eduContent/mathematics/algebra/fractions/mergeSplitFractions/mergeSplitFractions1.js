const { selectRandomly, getRandomInteger, getRandomBoolean, scm } = require('../../../../../util')
const { asExpression, expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons

// 1/(ax) + 1/(by) = (by + ax)/(abxy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

const data = {
	skill: 'mergeSplitFractions',
	steps: [null, ['addRemoveFractionFactors', 'addRemoveFractionFactors'], 'mergeSplitBasicFractions'],
	comparison: {
		default: onlyOrderChanges,
	},
}
addSetupFromSteps(data)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		plus: getRandomBoolean(), // Is there a plus or a minus sign?
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const { plus, a, b, x, y } = state

	// Set up the original expression.
	const leftExpression = asExpression(`1/(ax)`).substituteVariables(variables)
	const rightExpression = asExpression(`1/(by)`).substituteVariables(variables)
	const expression = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const scmValue = scm(a, b)
	const denominator = asExpression(`${scmValue}xy`).substituteVariables(variables).simplify({ sortProducts: true })
	const leftAns = leftExpression.multiplyNumDen(scmValue / a).multiplyNumDen(y).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const rightAns = rightExpression.multiplyNumDen(scmValue / b).multiplyNumDen(x).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const ans = leftAns.numerator[plus ? 'add' : 'subtract'](rightAns.numerator).divide(denominator)

	return { ...state, variables, leftExpression, rightExpression, expression, scmValue, denominator, leftAns, rightAns, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('denominator', input, solution, data.comparison)
	if (step === 2)
		return performComparison(['leftAns', 'rightAns'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
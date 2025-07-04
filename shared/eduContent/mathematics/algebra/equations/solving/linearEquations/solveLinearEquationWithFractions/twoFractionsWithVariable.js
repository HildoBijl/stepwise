const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, equationChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator, hasSumWithinProduct } = equationChecks

// (x+a)/(x+b)=(x+c)/(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const factorMovedComparison = { check: equivalent, allowSwitch: true }
const expandedComparison = { check: equivalent, allowSwitch: true }

const metaData = {
	skill: 'solveLinearEquationWithFractions',
	steps: ['moveEquationFactor', 'expandDoubleBrackets', 'solveLinearEquation'],
	factorMovedComparison,
	expandedComparison,
	comparison: {
		factorMoved: (input, correct, { variables }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
		expanded: (input, correct) => !hasSumWithinProduct(input) && correct.equals(input, expandedComparison),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = getRandomInteger(-8, 8, [0])
	const b = getRandomInteger(-8, 8, [0, a, -a])
	const c = getRandomInteger(-8, 8, [0, a, -a, b, -b])
	const d = getRandomInteger(-8, 8, [0, a, -a, b, -b, c, -c, b + c - a])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
	}
}

function getSolution(state) {
	const { a, b, c, d } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(x+a)/(x+b)=(x+c)/(x+d)').substituteVariables(variables).removeUseless()
	const factorMoved = asEquation('(x+a)(x+d)=(x+c)(x+b)').substituteVariables(variables).removeUseless()
	const expanded = factorMoved.regularClean({ expandProductsOfSums: true })
	const termMoved = asEquation(`(${a + d})*x - (${b + c})*x = ${c * b}-(${a * d})`).substituteVariables(variables).removeUseless()
	const cleaned = termMoved.regularClean()
	const factor = asExpression(a + d - b - c)
	const solution = asExpression(`${(c * b - a * d)}/${(a + d - b - c)}`)
	const ans = solution.regularClean()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substituteVariables({ [variables.x]: ans })
	const sideValue = equationInserted.left.regularClean()
	return { ...state, variables, equation, factorMoved, expanded, termMoved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'factorMoved')
		case 2:
			return performComparison(exerciseData, 'expanded')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

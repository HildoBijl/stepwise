const { sample, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons, equationChecks } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator, hasSumWithinProduct } = equationChecks

// (x+a)/(x+b)=(x+c)/(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const factorMovedComparison = { compareSide: equivalent, allowSwitch: true }
const expandedComparison = { compareSide: equivalent, allowSwitch: true }

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
		x: sample(variableSet),
		a, b, c, d,
	}
}

function getSolution(state) {
	const { a, b, c, d } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(x+a)/(x+b)=(x+c)/(x+d)').substitute(variables).removeTrivial()
	const factorMoved = asEquation('(x+a)(x+d)=(x+c)(x+b)').substitute(variables).removeTrivial()
	const expanded = factorMoved.combine(['expandProductsOfSums'])
	const termMoved = asEquation(`(${a + d})*x - (${b + c})*x = ${c * b}-(${a * d})`).substitute(variables).removeTrivial()
	const cleaned = termMoved.combine()
	const factor = asExpression(a + d - b - c)
	const solution = asExpression(`(${(c * b - a * d)})/${(a + d - b - c)}`)
	const ans = solution.combine()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substitute({ [variables.x]: ans })
	const sideValue = equationInserted.left.normalize()
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

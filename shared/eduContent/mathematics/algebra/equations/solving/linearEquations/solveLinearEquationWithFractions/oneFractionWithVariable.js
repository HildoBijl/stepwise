const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons, equationChecks } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// (a*x+b)/(x+c)=d.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const factorMovedComparison = { check: equivalent, allowSwitch: true }

const metaData = {
	skill: 'solveLinearEquationWithFractions',
	steps: ['moveEquationFactor', 'solveLinearEquation'],
	factorMovedComparison,
	comparison: {
		factorMoved: (input, correct, { variables }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = randomInteger(-8, 8, [-1, 0, 1])
	const c = randomInteger(-8, 8, [-1, 0, 1])
	const b = randomInteger(-8, 8, [0])
	const d = randomInteger(-8, 8, [0, a])
	return {
		x: sample(variableSet),
		a, b, c, d,
		switchSides: randomBoolean(),
	}
}

function getSolution(state) {
	const { a, b, c, d, switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(a*x+b)/(x+c)=d')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const factorMoved = asEquation('a*x+b=d(x+c)')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const expanded = factorMoved.combine(['expandProductsOfSums'])
	const termMoved = asEquation(switchSides ? `d*x-a*x=b-(${d * c})` : `a*x-d*x=(${d * c})-b`).substitute(variables).removeTrivial()
	const cleaned = termMoved.combine()
	const factor = asExpression(switchSides ? d - a : a - d)
	const solution = asExpression(switchSides ? `${b - d * c}/${d - a}` : `${d * c - b}/${a - d}`)
	const ans = solution.combine()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substitute({ [variables.x]: ans })
	const sideValue = equationInserted.left.combine()
	return { ...state, variables, equation, factorMoved, expanded, termMoved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'factorMoved')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

const { sample, randomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons, equationChecks } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// a/(x+b)=c/(x+d).
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
	const b = randomInteger(-8, 8, [0])
	const c = randomInteger(-8, 8, [-1, 0, 1, a, -a])
	const d = randomInteger(-8, 8, [0, b, -b])
	return {
		x: sample(variableSet),
		a, b, c, d,
	}
}

function getSolution(state) {
	const { a, b, c, d } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a/(x+b)=c/(x+d)').substitute(variables).removeTrivial()
	const factorMoved = asEquation('a(x+d)=c(x+b)').substitute(variables).removeTrivial()
	const expanded = factorMoved.combine({ expandProductsOfSums: true })
	const termMoved = asEquation(`a*x - c*x = ${c * b}-(${a * d})`).substitute(variables).removeTrivial()
	const cleaned = termMoved.combine()
	const factor = asExpression(a - c)
	const solution = asExpression(`${(c * b - a * d)}/${(a - c)}`)
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

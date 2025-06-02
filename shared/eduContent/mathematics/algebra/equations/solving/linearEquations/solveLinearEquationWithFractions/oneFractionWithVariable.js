const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, equationChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

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

function generateState() {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
	const b = getRandomInteger(-8, 8, [0, a * c, -a * c])
	const d = getRandomInteger(-8, 8, [0, b, -b])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
		switchSides: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { a, b, c, d, switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(a*x+b)/(x+c)=d')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const factorMoved = asEquation('a*x+b=d(x+c)')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const expanded = factorMoved.regularClean({ expandProductsOfSums: true })
	const termMoved = asEquation(switchSides ? `d*x-a*x=b-(${d * c})` : `a*x-d*x=(${d * c})-b`).substituteVariables(variables).removeUseless()
	const cleaned = termMoved.regularClean()
	const factor = asExpression(switchSides ? d - a : a - d)
	const solution = asExpression(switchSides ? `${b - d * c}/${d - a}` : `${d * c - b}/${a - d}`)
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
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

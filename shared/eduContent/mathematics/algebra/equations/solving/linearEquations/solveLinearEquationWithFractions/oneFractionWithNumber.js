const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, equationChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// a/(x+b)+c=d.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const factorMovedComparison = { check: equivalent, allowSwitch: true }

const metaData = {
	skill: 'solveLinearEquationWithFractions',
	steps: ['moveEquationTerm', 'moveEquationFactor', 'solveLinearEquation'],
	factorMovedComparison,
	comparison: {
		termMoved: { check: onlyOrderChanges, allowSwitch: true },
		factorMoved: (input, correct, { variables }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [0])
	const c = getRandomInteger(-8, 8, [-1, 0, 1])
	const d = getRandomInteger(-8, 8, [0, c, -c])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
		switchSides: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { a, b, c, d, switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a/(x+b)+c=d')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const termMoved = asEquation(`a/(x+b)=${d - c}`)[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const factorMoved = asEquation(`a=${d - c}(x+b)`)[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const expanded = factorMoved.regularClean({ expandProductsOfSums: true })
	const cleaned = asEquation(`a-(${(d - c) * b})=${d - c}x`)[switchSides ? 'switch' : 'self']().substituteVariables(variables).regularClean()
	const factor = asExpression(d - c)
	const solution = asExpression(`${a - (d - c) * b}/${d - c}`)
	const ans = solution.regularClean()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substituteVariables({ [variables.x]: ans })
	const sideValue = equationInserted.left.regularClean()
	return { ...state, variables, equation, termMoved, factorMoved, expanded, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'termMoved')
		case 2:
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

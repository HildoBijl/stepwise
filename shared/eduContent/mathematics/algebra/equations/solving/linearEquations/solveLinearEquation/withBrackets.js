const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, equationChecks, equationComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*(x+b)+e=c*(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	weight: 2,
	skill: 'solveProductEquation',
	steps: ['expandBrackets', 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation'],
	comparison: {
		expanded: (input, correct) => !equationChecks.hasSumWithinProduct(input) && equationComparisons.equivalent(input, correct),
		moved: { check: equivalent, allowSwitch: true, allowMinus: true },
		cleaned: { check: onlyOrderChanges, allowSwitch: true, allowMinus: true },
		ans: onlyOrderChanges,
	}
}

function generateState(example) {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [0, a, -a])
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a])
	const d = getRandomInteger(-8, 8, [0])
	const e = getRandomInteger(-8, 8, [0])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e,
		switchSides: getRandomBoolean(),
		bracketsRight: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { a, b, c, d, e, switchSides, bracketsRight } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation(bracketsRight ? 'a*(x+b)+e=c*(x+d)' : 'a*(x+b)+e=c*x+d')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const expanded = equation.regularClean({ expandProductsOfSums: true })
	const moved = asEquation(`a*x-c*x=${bracketsRight ? c * d : d}-(${a * b + e})`)[switchSides ? 'applyMinus' : 'self']()[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const cleaned = moved.regularClean()
	const factor = asExpression(switchSides ? c - a : a - c)
	const solution = asExpression(`${(bracketsRight ? c * d : d) - (a * b + e)}/${a - c}`)
	const ans = solution.regularClean()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substituteVariables({ [variables.x]: ans })
	const sideValue = equationInserted.left.regularClean()
	return { ...state, variables, equation, expanded, moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'expanded')
		case 2:
			return performComparison(exerciseData, 'moved')
		case 3:
			return performComparison(exerciseData, 'cleaned')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

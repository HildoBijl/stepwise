const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons, equationChecks, equationComparisons } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { filterVariables } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*(x+b)+e=c*(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	weight: 2,
	skill: 'solveLinearEquation',
	...stepsToSetup(['expandBrackets', 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation']),
	compare: {
		expanded: (input, correct) => !equationChecks.hasSumWithinProduct(input) && equationComparisons.equivalent(input, correct),
		moved: { compareSide: equivalent, allowSwitch: true, allowMinus: true },
		cleaned: { compareSide: onlyOrderChanges, allowSwitch: true, allowMinus: true },
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
		x: sample(variableSet),
		a, b, c, d, e,
		switchSides: getRandomBoolean(),
		bracketsRight: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { a, b, c, d, e, switchSides, bracketsRight } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation(bracketsRight ? 'a*(x+b)+e=c*(x+d)' : 'a*(x+b)+e=c*x+d', { eAsConstant: false })[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const expanded = equation.combine(['expandProductsOfSums'])
	const moved = asEquation(`a*x-c*x=${bracketsRight ? c * d : d}-(${a * b + e})`)[switchSides ? 'negate' : 'self']().substitute(variables).removeTrivial(['expandMinusSums'])
	const cleaned = moved.combine()
	const factor = asExpression(switchSides ? c - a : a - c)
	const solution = asExpression(`${(bracketsRight ? c * d : d) - (a * b + e)}/${a - c}`)
	const ans = solution.normalize()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substitute({ [variables.x]: ans })
	const sideValue = equationInserted.left.normalize()
	return { ...state, variables, equation, expanded, moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('expanded', data)
		case 2:
			return compare('moved', data)
		case 3:
			return compare('cleaned', data)
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

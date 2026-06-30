const { sample, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x+b=c*x+d.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'solveLinearEquation',
	steps: ['moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation'],
	comparison: {
		moved: { compareSide: equivalent, allowSwitch: true, allowMinus: true },
		cleaned: { compareSide: onlyOrderChanges, allowSwitch: true, allowMinus: true },
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [0, a, -a])
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a])
	const d = getRandomInteger(-8, 8, [0])
	return {
		x: sample(variableSet),
		a, b, c, d,
	}
}

function getSolution(state) {
	const { a, b, c, d } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a*x+b=c*x+d').substitute(variables).removeTrivial()
	const moved = asEquation('a*x-c*x=d-b').substitute(variables).removeTrivial()
	const cleaned = moved.combine()
	const factor = asExpression(a - c)
	const solution = asExpression(`${d - b}/${a - c}`)
	const ans = solution.normalize()
	const canCleanSolution = !onlyOrderChanges(solution, ans)
	const equationInserted = equation.substitute({ [variables.x]: ans })
	const sideValue = equationInserted.left.normalize()
	return { ...state, variables, equation, moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'moved')
		case 2:
			return performComparison(exerciseData, 'cleaned')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

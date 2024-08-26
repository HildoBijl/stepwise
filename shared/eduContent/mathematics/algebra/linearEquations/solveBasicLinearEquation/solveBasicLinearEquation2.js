const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { repeat } = require('../../../../../skillTracking')
const { asEquation, expressionComparisons, equationComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

// x/y + a = bz + cx.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveBasicLinearEquation',
	steps: [repeat('moveATerm', 2), 'pullFactorOutOfBrackets', 'multiplyDivideAllTerms'],
	comparison: {
		ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
		default: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyMinus()), // Allow switches and minus signs.
		pulledOut: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyToRight(side => side.applyMinus()).applyToLeft(side => side.applyToTerm(1, factor => factor.applyMinus()))), // Allow switches and minus signs inside the brackets.
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
		c: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('x/y + a = bz + cx').substituteVariables(variables).removeUseless()

	// Find the solution.
	const termsMoved = equation.subtract(equation.left.terms[1]).subtract(equation.right.terms[1]).simplify({ cancelSumTerms: true })
	const pulledOut = termsMoved.applyToLeft(left => left.pullOutsideBrackets(variables.x, { flattenFractions: true }))
	const bracketTerm = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = termsMoved.right.divide(bracketTerm)
	const ansCleaned = ans.multiplyNumDen(variables.y).simplify({ expandProductsOfSums: true }).cleanForAnalysis()

	return { ...state, variables, equation, termsMoved, pulledOut, bracketTerm, ans, ansCleaned }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'termsMoved')
		case 2:
			return performComparison(exerciseData, 'pulledOut')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

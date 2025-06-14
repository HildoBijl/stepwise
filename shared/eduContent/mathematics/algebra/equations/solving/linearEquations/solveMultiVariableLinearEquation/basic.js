const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { repeat } = require('../../../../../../../skillTracking')
const { asEquation, expressionComparisons, equationComparisons } = require('../../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// ax + by = cxy + dz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'solveMultiVariableLinearEquation',
	steps: ['moveEquationTerm', 'pullFactorOutOfBrackets', 'multiplyAllEquationTerms'],
	comparison: {
		termsMoved: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyMinus()), // Allow switches and minus signs.
		pulledOut: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyToRight(side => side.applyMinus()).applyToLeft(side => side.applyToTerm(1, factor => factor.applyMinus()))), // Allow switches and minus signs inside the brackets.
		ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
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
		d: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('ax + by = cxy + dz').substituteVariables(variables).removeUseless()

	// Find the solution.
	const termsMoved = equation.subtract(equation.left.terms[1]).subtract(equation.right.terms[0]).simplify({ cancelSumTerms: true })
	const pulledOut = termsMoved.applyToLeft(left => left.pullOutsideBrackets(variables.x))
	const bracketTerm = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = termsMoved.right.divide(bracketTerm)

	// Check the solution.
	const equationWithSolution = equation.substituteVariables({ [variables.x]: ans })
	const equationWithSolutionMergedFractions = equationWithSolution.basicClean({ mergeFractionSums: true })
	const equationWithSolutionExpandedBrackets = equationWithSolutionMergedFractions.basicClean({ expandProductsOfSums: true, sortSums: true })

	return { ...state, variables, equation, termsMoved, pulledOut, bracketTerm, ans, equationWithSolution, equationWithSolutionMergedFractions, equationWithSolutionExpandedBrackets }
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

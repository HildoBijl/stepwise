const { sample, randomInteger } = require('@step-wise/utils')
const { repeat } = require('@step-wise/skill-setup')
const { asEquation, expressionComparisons, equationComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// (ax+bz)y = cx + d.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'solveMultiVariableLinearEquation',
	steps: ['expandBrackets', repeat('moveEquationTerm', 2), 'pullFactorOutOfBrackets', 'multiplyAllEquationTerms'],
	comparison: {
		default: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.negate().normalize()), // Allow switches and minus signs.
		pulledOut: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.mapRight(side => side.negate()).mapLeft(side => side.mapFactors((factor, index) => index === 1 ? factor.negate() : factor)).normalize()), // Allow switches and minus signs inside the brackets.
		ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = sample(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: randomInteger(-12, 12, [0]),
		b: randomInteger(-12, 12, [0]),
		c: randomInteger(-12, 12, [0]),
		d: randomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(ax+bz)y = cx + d').substitute(variables).removeTrivial()

	// Find the solution.
	const bracketsExpanded = equation.flatten(['expandProductsOfSums'])
	const termsMoved = bracketsExpanded.subtract(bracketsExpanded.left.terms[1]).subtract(bracketsExpanded.right.terms[0]).removeTrivial(['cancelSumTerms'])
	const pulledOut = termsMoved.mapLeft(left => left.factorOut(variables.x).combine())
	const bracketTerm = pulledOut.left.find(exp => exp.isProduct()).factors.find(factor => !factor.equalStructure(variables.x))
	const ans = termsMoved.right.divide(bracketTerm)

	// Check the solution.
	const equationWithSolution = equation.substitute({ [variables.x]: ans })
	const equationWithSolutionMergedFractions = equationWithSolution.removeTrivial(['mergeFractionProducts', 'mergeFractionSums'])
	const equationWithSolutionExpandedBrackets = equationWithSolutionMergedFractions.combine(['expandProductsOfSums', 'expandMinusSums', 'sortSums'])

	return { ...state, variables, equation, termsMoved, bracketsExpanded, pulledOut, bracketTerm, ans, equationWithSolution, equationWithSolutionMergedFractions, equationWithSolutionExpandedBrackets }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'bracketsExpanded')
		case 2:
			return performComparison(exerciseData, 'termsMoved')
		case 3:
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

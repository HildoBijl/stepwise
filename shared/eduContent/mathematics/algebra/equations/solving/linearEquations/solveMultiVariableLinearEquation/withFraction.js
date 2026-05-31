const { sample, randomInteger } = require('@step-wise/utils')
const { repeat } = require('@step-wise/skill-setup')
const { asEquation, expressionComparisons, equationComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// x/y + a = bz + cx.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableLinearEquation',
	steps: [repeat('moveEquationTerm', 2), 'pullFactorOutOfBrackets', 'multiplyAllEquationTerms'],
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
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('x/y + a = bz + cx').substitute(variables).removeTrivial()

	// Find the solution.
	const termsMoved = equation.subtract(equation.left.terms[1]).subtract(equation.right.terms[1]).removeTrivial(['cancelSumTerms'])
	const pulledOut = termsMoved.mapLeft(left => left.factorOut(variables.x).combine())
	const bracketTerm = pulledOut.left.find(exp => exp.isProduct()).factors.find(factor => !factor.equalStructure(variables.x))
	const ans = termsMoved.right.divide(bracketTerm)
	const ansCleaned = ans.normalize(['expandProductsOfSums'])

	// Check the solution.
	const equationWithSolution = equation.substitute({ [variables.x]: ansCleaned })
	const equationWithSolutionMergedFractions = equationWithSolution.cancel(['flattenFractions', 'expandMinusSums', 'mergeFractionProducts', 'mergeFractionSums'])
	const equationWithSolutionExpandedBrackets = equationWithSolutionMergedFractions.combine(['expandProductsOfSums', 'expandMinusSums', 'sortSums'])

	return { ...state, variables, equation, termsMoved, pulledOut, bracketTerm, ans, ansCleaned, equationWithSolution, equationWithSolutionMergedFractions, equationWithSolutionExpandedBrackets }
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

const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

// 1/(a/w+b/x) = y/z.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b']

const metaData = {
	skill: 'solveGeneralLinearEquation',
	steps: ['simplifyMultiVariableFraction', 'multiplyAllEquationTerms', 'expandBrackets', 'solveBasicLinearEquation'],
	comparison: {
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
		simplified: (input, correct) => expressionComparisons.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionComparisons.equivalent(input.left, correct.left),
		multiplied: (input, correct, { variables }) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions.
		expanded: (input, correct) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input) && !equationChecks.hasSumWithinProduct(input), // No fractions and no unexpanded brackets left.
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('1/(a/w+b/x) = y/z').substituteVariables(variables).removeUseless()

	// Find the solution.
	const simplified = equation.applyToLeft(side => side.cleanForAnalysis({ sortSums: false }))
	const multiplied = simplified.applyToBothSides(side => side.multiply(simplified.left.denominator).multiply(simplified.right.denominator)).regularClean()
	const expanded = multiplied.simplify({ expandProductsOfSums: true, splitFractions: true, mergeProductNumbers: true })
	const termToMove = expanded.right.terms.find(term => term.dependsOn(variables.x))
	const shifted = expanded.subtract(termToMove).regularClean()
	const pulledOut = shifted.applyToLeft(side => side.pullOutsideBrackets(variables.x).regularClean())
	const bracketFactor = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.right.divide(bracketFactor).cleanForAnalysis({ sortSums: false })

	return { ...state, variables, equation, simplified, multiplied, expanded, termToMove, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'simplified')
		case 2:
			return performComparison(exerciseData, 'multiplied')
		case 3:
			return performComparison(exerciseData, 'expanded')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

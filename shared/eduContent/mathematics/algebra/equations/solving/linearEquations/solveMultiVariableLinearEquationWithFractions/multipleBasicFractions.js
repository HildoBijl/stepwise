const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('../../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// (y+b)/(x+c) + a/x = z/x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableLinearEquationWithFractions',
	steps: ['simplifyFractionOfFractionSumsWithMultipleVariables', 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'],
	comparison: {
		multiplied: (input, correct) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions left.
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
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
	const equation = asEquation('(y+b)/(x+c) + a/x = z/x').substituteVariables(variables).removeUseless()

	// Find the solution.
	const factor1 = variables.x
	const factor2 = equation.left.terms[0].denominator
	const factor = factor1.multiply(factor2)
	const multiplied = equation.applyToLeft(side => side.applyToAllTerms(term => term.multiply(factor))).applyToRight(side => side.multiply(factor)).basicClean({ crossOutFractionFactors: true })
	const expanded = multiplied.simplify({ expandProductsOfSums: true, mergeProductNumbers: true })
	const merged = expanded.regularClean({ sortProducts: false })
	const shifted = merged.subtract(expanded.left.terms[3]).subtract(expanded.right.terms[0]).basicClean()
	const pulledOut = shifted.applyToLeft(side => side.pullOutsideBrackets(variables.x))
	const bracketFactor = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.right.divide(bracketFactor)

	return { ...state, variables, equation, factor1, factor2, factor, multiplied, expanded, merged, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'multiplied')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

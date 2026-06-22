const { sample, getRandomInteger } = require('@step-wise/utils')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// (y+b)/(x+c) + a/x = z/x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableLinearEquationWithFractions',
	steps: ['multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'],
	comparison: {
		multiplied: (input, correct) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions left.
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = sample(availableVariableSets)
	const a = getRandomInteger(-12, 12, [0])
	const b = getRandomInteger(-12, 12, [0, a, -a])
	const c = getRandomInteger(-12, 12, [0, a, -a, b, -b])
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a, b, c,
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(y+b)/(x+c) + a/x = z/x').substitute(variables).removeTrivial()

	// Find the solution.
	const factor1 = variables.x
	const factor2 = equation.left.terms[0].denominator
	const factor = factor1.multiply(factor2)
	const multiplied = equation.mapLeft(side => side.mapTerms(term => term.multiply(factor))).mapRight(side => side.multiply(factor)).cancel(['mergeFractionProducts'])
	const expanded = multiplied.simplify(['expandProductsOfSums', 'expandMinusSums', 'mergeProductNumbers'])
	const merged = expanded.combine()
	const shifted = merged.subtract(merged.left.terms[2]).subtract(merged.right.terms[0]).cancel()
	const pulledOut = shifted.mapLeft(side => side.factorOut(variables.x).combine())
	const bracketFactor = pulledOut.left.factors.find(factor => !variables.x.equals(factor))
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

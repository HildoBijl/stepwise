const { sample, getRandomInteger } = require('@step-wise/utils')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// (ax-x^2/y)/(bx^2) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['w', 'x', 'y'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableLinearEquationWithFractions',
	steps: ['simplifyFractionOfFractionSumsWithMultipleVariables', 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'],
	comparison: {
		simplified: (input, correct) => expressionComparisons.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionComparisons.equivalent(input.left, correct.left),
		multiplied: (input, correct) => !equationChecks.hasFraction(input) && (equationComparisons.equivalentSides(input, correct) || equationComparisons.equivalentSides(input, correct.negate())),
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = sample(availableVariableSets)
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
	const equation = asEquation('(ax-x^2/y)/(bx^2) = cz').substitute(variables).removeTrivial()

	// Find the solution.
	const simplified = equation.mapLeft(left => left.combine(['mergeFractionSums']))
	const multiplied = simplified.mapSides(side => side.multiply(simplified.left.denominator)).combine()
	const shifted = multiplied.subtract(multiplied.left.terms[1]).cancel()
	const pulledOut = shifted.mapRight(side => side.factorOut(variables.x).combine())
	const bracketFactor = pulledOut.right.factors.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.left.divide(bracketFactor).combine()

	return { ...state, variables, equation, simplified, multiplied, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'simplified')
		case 2:
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

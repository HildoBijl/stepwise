const { sample, getRandomInteger } = require('@step-wise/utils')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { selectRandomVariables, filterVariables } = require('../../../../../../../eduTools')

// 1/(a/w+b/x) = y/z.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b']

const metaData = {
	skill: 'solveMultiVariableLinearEquationWithFractions',
	...stepsToSetup(['simplifyFractionOfFractionSumsWithMultipleVariables', 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation']),
	compare: {
		simplified: (input, correct) => expressionComparisons.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionComparisons.equivalent(input.left, correct.left),
		multiplied: (input, correct) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions.
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
	},
}

function generateState() {
	const variableSet = sample(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('1/(a/w+b/x) = y/z').substitute(variables).removeTrivial()

	// Find the solution.
	const simplified = equation.mapLeft(side => side.combine(['mergeFractionSums']))
	const multiplied = simplified.mapSides(side => side.multiply(simplified.left.denominator).multiply(simplified.right.denominator)).combine()
	const expanded = multiplied.combine(['expandProductsOfSums', 'expandMinusSums'])
	const termToMove = expanded.right.terms.find(term => term.dependsOn(variables.x))
	const shifted = expanded.subtract(termToMove).combine()
	const pulledOut = shifted.mapLeft(side => side.factorOut(variables.x).combine())
	const bracketFactor = pulledOut.left.factors.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.right.divide(bracketFactor).combine()

	return { ...state, variables, equation, simplified, multiplied, expanded, termToMove, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('simplified', data)
		case 2:
			return compare('multiplied', data)
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

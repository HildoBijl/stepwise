import { sample, randomInteger } from '@step-wise/js-utils'
import { type Equation, type Expression, asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

// 1/(a/w+b/x) = y/z.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b']

export default buildStepExercise({
	metadata: {
		skill: 'solveMultiVariableLinearEquationWithFractions',
		...createStepExerciseMetadata(['simplifyFractionOfFractionSumsWithMultipleVariables', 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation']),
		comparisons: {
			simplified: (input: Equation, correct: Equation) => expressionComparisons.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionComparisons.areEquivalent(input.left, correct.left),
			multiplied: (input: Equation, correct: Equation) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions.
			ans: (input: Expression, correct: Expression) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.areEquivalent(input, correct),
		},
	},

	generateParameters() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(-12, 12, { exclude: [0] }),
			b: randomInteger(-12, 12, { exclude: [0] }),
		}
	},

	getSolution(parameters) {
		// Extract parameters variables.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('1/(a/w+b/x) = y/z').substitute(variables).removeTrivial()

		// Find the solution.
		const simplified = equation.mapLeft(side => side.combine(['mergeFractionSums']))
		const multiplied = simplified.mapSides(side => side.multiply(simplified.left.denominator).multiply(simplified.right.denominator)).combine()
		const expanded = multiplied.combine(['expandProductsOfSums', 'expandMinusSums'])
		const termToMove = expanded.right.terms.find(term => term.dependsOn(variables.x))
		if (!termToMove) throw new Error('Expected the expanded equation to contain a term depending on the target variable.')
		const shifted = expanded.subtract(termToMove).combine()
		const pulledOut = shifted.mapLeft(side => side.factorOut(variables.x).combine())
		const bracketFactor = pulledOut.left.factors.find(factor => !variables.x.equals(factor))
		if (!bracketFactor) throw new Error('Expected the isolated side to contain a bracket factor.')
		const ans = pulledOut.right.divide(bracketFactor).combine()

		return { ...parameters, variables, equation, simplified, multiplied, expanded, termToMove, shifted, pulledOut, bracketFactor, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('simplified', data)
			case 2: return compareInputs('multiplied', data)
			default: return compareInputs('ans', data)
		}
	},
})

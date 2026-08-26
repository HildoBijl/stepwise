import { sample, randomInteger } from '@step-wise/js-utils'
import { type Equation, type Expression, asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

// (ax-x^2/y)/(bx^2) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['w', 'x', 'y'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'solveMultiVariableLinearEquationWithFractions',
		...createStepExerciseMetadata(['simplifyFractionOfFractionSumsWithMultipleVariables', 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation']),
		comparisons: {
			simplified: (input: Equation, correct: Equation) => expressionComparisons.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionComparisons.equivalent(input.left, correct.left),
			multiplied: (input: Equation, correct: Equation) => !equationChecks.hasFraction(input) && (equationComparisons.equivalentSides(input, correct) || equationComparisons.equivalentSides(input, correct.negate())),
			ans: (input: Expression, correct: Expression) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
		},
	},

	generateParameters() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(-12, 12, { exclude: [0] }),
			b: randomInteger(-12, 12, { exclude: [0] }),
			c: randomInteger(-12, 12, { exclude: [0] }),
		}
	},

	getSolution(parameters) {
		// Extract parameters variables.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('(ax-x^2/y)/(bx^2) = cz').substitute(variables).removeTrivial()

		// Find the solution.
		const simplified = equation.mapLeft(left => left.combine(['mergeFractionSums']))
		const multiplied = simplified.mapSides(side => side.multiply(simplified.left.denominator)).combine()
		const shifted = multiplied.subtract(multiplied.left.terms[1]).cancel()
		const pulledOut = shifted.mapRight(side => side.factorOut(variables.x).combine())
		const bracketFactor = pulledOut.right.factors.find(factor => !variables.x.equals(factor))
		if (!bracketFactor) throw new Error('Expected the isolated side to contain a bracket factor.')
		const ans = pulledOut.left.divide(bracketFactor).combine()

		return { ...parameters, variables, equation, simplified, multiplied, shifted, pulledOut, bracketFactor, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('simplified', data)
			case 2: return compareInputs('multiplied', data)
			default: return compareInputs('ans', data)
		}
	},
})

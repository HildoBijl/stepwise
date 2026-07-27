import { sample, getRandomInteger } from '@step-wise/utils'
import { type Equation, type Expression, asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '../../../../../generationTools'

// (y+b)/(x+c) + a/x = z/x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'solveMultiVariableLinearEquationWithFractions',
		...stepsToSetup(['multiplyAllEquationTerms', 'solveMultiVariableLinearEquation']),
		compare: {
			multiplied: (input: Equation, correct: Equation) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions left.
			ans: (input: Expression, correct: Expression) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
		},
	},

	generateState() {
		const a = getRandomInteger(-12, 12, [0])
		const b = getRandomInteger(-12, 12, [0, a, -a])
		const c = getRandomInteger(-12, 12, [0, a, -a, b, -b])
		return { ...selectRandomVariables(sample(availableVariableSets), usedVariables), a, b, c }
	},

	getSolution(state) {
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
		if (!bracketFactor) throw new Error('Expected the isolated side to contain a bracket factor.')
		const ans = pulledOut.right.divide(bracketFactor)

		return { ...state, variables, equation, factor1, factor2, factor, multiplied, expanded, merged, shifted, pulledOut, bracketFactor, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('multiplied', data)
			default: return compare('ans', data)
		}
	},
})

import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks
const { multiplyNumeratorAndDenominator } = expressionOperations

// (a+x/y)/(z^b/x+c).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionOfFractionSumsWithMultipleVariables',
		...stepsToSetup(['addFractionsWithMultipleVariables', 'addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables']),
		compare: { Expression: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct) },
	},

	generateState() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: getRandomInteger(2, 12),
			b: getRandomInteger(2, 4),
			c: getRandomInteger(2, 12),
			plus1: getRandomBoolean(),
			plus2: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const term1 = asExpression('a').substitute(variables)
		const fraction1 = asExpression('x/y').substitute(variables)
		const numerator = state.plus1 ? term1.add(fraction1) : term1.subtract(fraction1)
		const fraction2 = asExpression('z^b/x').substitute(variables)
		const term2 = asExpression('c').substitute(variables)
		const denominator = state.plus2 ? fraction2.add(term2) : fraction2.subtract(term2)
		const expression = numerator.divide(denominator)
		const term1Intermediate = multiplyNumeratorAndDenominator(term1, fraction1.denominator)
		const numeratorSplit = state.plus1 ? term1Intermediate.add(fraction1) : term1Intermediate.subtract(fraction1)
		const numeratorIntermediate = (state.plus1 ? term1Intermediate.numerator.add(fraction1.numerator) : term1Intermediate.numerator.subtract(fraction1.numerator)).divide(fraction1.denominator).combine()
		const term2Intermediate = multiplyNumeratorAndDenominator(term2, fraction2.denominator)
		const denominatorSplit = state.plus2 ? fraction2.add(term2Intermediate) : fraction2.subtract(term2Intermediate)
		const denominatorIntermediate = (state.plus2 ? fraction2.numerator.add(term2Intermediate.numerator) : fraction2.numerator.subtract(term2Intermediate.numerator)).divide(fraction2.denominator).combine()
		const intermediate = numeratorIntermediate.divide(denominatorIntermediate)
		const ans = intermediate.cancel(['flattenFractions'])
		return { ...state, variables, term1, fraction1, numerator, fraction2, term2, denominator, expression, term1Intermediate, numeratorSplit, numeratorIntermediate, term2Intermediate, denominatorSplit, denominatorIntermediate, intermediate, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('numeratorIntermediate', data)
			case 2: return compare('denominatorIntermediate', data)
			default: return compare('ans', data)
		}
	},
})

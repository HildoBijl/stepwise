import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { gcd } from '@step-wise/math-tools'
import { asExpression, expressionComparisons, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '../../../../../generationTools'

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (x/a + y/b)/(cz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionOfFractionSumsWithMultipleVariables',
		...stepsToSetup(['addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables']),
		compare: { Expression: onlyOrderChanges },
	},

	generateState() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: getRandomInteger(2, 12),
			b: getRandomInteger(2, 12),
			c: getRandomInteger(2, 12),
			plus: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const fraction1 = asExpression('x/a').substitute(variables)
		const fraction2 = asExpression('y/b').substitute(variables)
		const numerator = state.plus ? fraction1.add(fraction2) : fraction1.subtract(fraction2)
		const denominator = asExpression('cz').substitute(variables)
		const expression = numerator.divide(denominator)
		const gcdValue = gcd(state.a, state.b)
		const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, state.b / gcdValue).flatten(['mergeProductNumbers'])
		const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, state.a / gcdValue).flatten(['mergeProductNumbers'])
		const intermediateSplit = state.plus ? fraction1Intermediate.add(fraction2Intermediate) : fraction1Intermediate.subtract(fraction2Intermediate)
		const intermediate = (state.plus ? fraction1Intermediate.numerator.add(fraction2Intermediate.numerator) : fraction1Intermediate.numerator.subtract(fraction2Intermediate.numerator)).divide(fraction1Intermediate.denominator).combine()
		const expressionWithIntermediate = intermediate.divide(denominator)
		const simplifiedExpressionWithIntermediate = intermediate.numerator.divide(intermediate.denominator.multiply(denominator)).flatten()
		const ans = asExpression(`(${state.b / gcdValue}x ${state.plus ? '+' : '-'} ${state.a / gcdValue}y)/(${state.a * state.b * state.c / gcdValue}z)`).substitute(variables).combine()
		return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('intermediate', data)
			default: return compare('ans', data)
		}
	},
})

import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { asExpression, expressionComparisons, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (c/x)/(a/x^2 + b/(xy)) = (cxy)/(ay+bx).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
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
			a: randomInteger(2, 12),
			b: randomInteger(2, 12),
			c: randomInteger(2, 12),
			plus: randomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const gcdValue = gcd(state.a, state.b, state.c)
		const fraction1 = asExpression('a/x^2').substitute(variables)
		const fraction2 = asExpression('b/(xy)').substitute(variables)
		const numerator = asExpression('c/x').substitute(variables)
		const denominator = state.plus ? fraction1.add(fraction2) : fraction1.subtract(fraction2)
		const expression = numerator.divide(denominator)
		const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, variables.y).mergeNumbers(['mergeProductFactors'])
		const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, variables.x).mergeNumbers(['mergeProductFactors'])
		const intermediateSplit = state.plus ? fraction1Intermediate.add(fraction2Intermediate) : fraction1Intermediate.subtract(fraction2Intermediate)
		const intermediate = (state.plus ? fraction1Intermediate.numerator.add(fraction2Intermediate.numerator) : fraction1Intermediate.numerator.subtract(fraction2Intermediate.numerator)).divide(fraction1Intermediate.denominator).combine()
		const expressionWithIntermediate = numerator.divide(intermediate)
		const ans = asExpression(`(${state.c / gcdValue}xy)/(${state.a / gcdValue}y ${state.plus ? '+' : '-'} ${state.b / gcdValue}x)`).substitute(variables).combine()
		return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('intermediate', data)
			default: return compare('ans', data)
		}
	},
})

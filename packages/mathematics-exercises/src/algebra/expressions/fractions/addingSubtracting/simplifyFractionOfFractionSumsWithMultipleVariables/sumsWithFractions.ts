import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { gcd } from '@step-wise/math-tools'
import { type Expression, asExpression, expressionComparisons, expressionChecks, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks
const { multiplyNumeratorAndDenominator } = expressionOperations

// (a/w + b/x)/(c/y + d/z).
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

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
			b: getRandomInteger(2, 12),
			c: getRandomInteger(2, 12),
			d: getRandomInteger(2, 12),
			plus1: getRandomBoolean(),
			plus2: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const fraction1 = asExpression('a/w').substitute(variables)
		const fraction2 = asExpression('b/x').substitute(variables)
		const fraction3 = asExpression('c/y').substitute(variables)
		const fraction4 = asExpression('d/z').substitute(variables)
		const numerator = state.plus1 ? fraction1.add(fraction2) : fraction1.subtract(fraction2)
		const denominator = state.plus2 ? fraction3.add(fraction4) : fraction3.subtract(fraction4)
		const expression = numerator.divide(denominator)
		const gcdValue = gcd(state.a, state.b, state.c, state.d)
		const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, variables.x).flatten(['sortProducts'])
		const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, variables.w).flatten(['sortProducts'])
		const fraction3Intermediate = multiplyNumeratorAndDenominator(fraction3, variables.z).flatten(['sortProducts'])
		const fraction4Intermediate = multiplyNumeratorAndDenominator(fraction4, variables.y).flatten(['sortProducts'])
		const numeratorSplit = state.plus1 ? fraction1Intermediate.add(fraction2Intermediate) : fraction1Intermediate.subtract(fraction2Intermediate)
		const denominatorSplit = state.plus2 ? fraction3Intermediate.add(fraction4Intermediate) : fraction3Intermediate.subtract(fraction4Intermediate)
		const numeratorIntermediate = (state.plus1 ? fraction1Intermediate.numerator.add(fraction2Intermediate.numerator) : fraction1Intermediate.numerator.subtract(fraction2Intermediate.numerator)).divide(fraction1Intermediate.denominator).combine()
		const denominatorIntermediate = (state.plus2 ? fraction3Intermediate.numerator.add(fraction4Intermediate.numerator) : fraction3Intermediate.numerator.subtract(fraction4Intermediate.numerator)).divide(fraction3Intermediate.denominator).combine()
		const intermediate = numeratorIntermediate.divide(denominatorIntermediate)
		const intermediateFlipped = intermediate.numerator.multiply(intermediate.denominator.invert())
		const intermediateMerged = intermediateFlipped.flatten(['mergeFractionProducts'])
		const ans = asExpression(`((${state.a / gcdValue}x ${state.plus1 ? '+' : '-'} ${state.b / gcdValue}w)yz)/(wx(${state.c / gcdValue}z ${state.plus2 ? '+' : '-'} ${state.d / gcdValue}y))`).substitute(variables).removeTrivial(['sortProducts'])
		return { ...state, variables, fraction1, fraction2, fraction3, fraction4, numerator, denominator, expression, gcdValue, fraction1Intermediate, fraction2Intermediate, fraction3Intermediate, fraction4Intermediate, numeratorSplit, denominatorSplit, numeratorIntermediate, denominatorIntermediate, intermediate, intermediateFlipped, intermediateMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('numeratorIntermediate', data)
			case 2: return compare('denominatorIntermediate', data)
			default: return compare('ans', data)
		}
	},
})

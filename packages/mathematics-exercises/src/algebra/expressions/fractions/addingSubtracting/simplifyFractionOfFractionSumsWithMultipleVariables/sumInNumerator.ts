import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { asExpression, expressionComparisons, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (x/a + y/b)/(cz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyFractionOfFractionSumsWithMultipleVariables',
		...createStepExerciseMetadata(['addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables']),
		comparisons: { Expression: onlyOrderChanges },
	},

	generateParameters() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(2, 12),
			b: randomInteger(2, 12),
			c: randomInteger(2, 12),
			plus: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const fraction1 = asExpression('x/a').substitute(variables)
		const fraction2 = asExpression('y/b').substitute(variables)
		const numerator = parameters.plus ? fraction1.add(fraction2) : fraction1.subtract(fraction2)
		const denominator = asExpression('cz').substitute(variables)
		const expression = numerator.divide(denominator)
		const gcdValue = gcd(parameters.a, parameters.b)
		const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, parameters.b / gcdValue).flatten(['mergeProductNumbers'])
		const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, parameters.a / gcdValue).flatten(['mergeProductNumbers'])
		const intermediateSplit = parameters.plus ? fraction1Intermediate.add(fraction2Intermediate) : fraction1Intermediate.subtract(fraction2Intermediate)
		const intermediate = (parameters.plus ? fraction1Intermediate.numerator.add(fraction2Intermediate.numerator) : fraction1Intermediate.numerator.subtract(fraction2Intermediate.numerator)).divide(fraction1Intermediate.denominator).combine()
		const expressionWithIntermediate = intermediate.divide(denominator)
		const simplifiedExpressionWithIntermediate = intermediate.numerator.divide(intermediate.denominator.multiply(denominator)).flatten()
		const ans = asExpression(`(${parameters.b / gcdValue}x ${parameters.plus ? '+' : '-'} ${parameters.a / gcdValue}y)/(${parameters.a * parameters.b * parameters.c / gcdValue}z)`).substitute(variables).combine()
		return { ...parameters, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('intermediate', data)
			default: return compareInputs('ans', data)
		}
	},
})

import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { type Expression, asExpression, expressionComparisons, expressionChecks, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
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
	metadata: {
		skill: 'simplifyFractionOfFractionSumsWithMultipleVariables',
		...createStepExerciseMetadata(['addFractionsWithMultipleVariables', 'addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables']),
		compare: { Expression: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct) },
	},

	generateParameters() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(2, 12),
			b: randomInteger(2, 12),
			c: randomInteger(2, 12),
			d: randomInteger(2, 12),
			plus1: randomBoolean(),
			plus2: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const fraction1 = asExpression('a/w').substitute(variables)
		const fraction2 = asExpression('b/x').substitute(variables)
		const fraction3 = asExpression('c/y').substitute(variables)
		const fraction4 = asExpression('d/z').substitute(variables)
		const numerator = parameters.plus1 ? fraction1.add(fraction2) : fraction1.subtract(fraction2)
		const denominator = parameters.plus2 ? fraction3.add(fraction4) : fraction3.subtract(fraction4)
		const expression = numerator.divide(denominator)
		const gcdValue = gcd(parameters.a, parameters.b, parameters.c, parameters.d)
		const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, variables.x).flatten(['sortProducts'])
		const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, variables.w).flatten(['sortProducts'])
		const fraction3Intermediate = multiplyNumeratorAndDenominator(fraction3, variables.z).flatten(['sortProducts'])
		const fraction4Intermediate = multiplyNumeratorAndDenominator(fraction4, variables.y).flatten(['sortProducts'])
		const numeratorSplit = parameters.plus1 ? fraction1Intermediate.add(fraction2Intermediate) : fraction1Intermediate.subtract(fraction2Intermediate)
		const denominatorSplit = parameters.plus2 ? fraction3Intermediate.add(fraction4Intermediate) : fraction3Intermediate.subtract(fraction4Intermediate)
		const numeratorIntermediate = (parameters.plus1 ? fraction1Intermediate.numerator.add(fraction2Intermediate.numerator) : fraction1Intermediate.numerator.subtract(fraction2Intermediate.numerator)).divide(fraction1Intermediate.denominator).combine()
		const denominatorIntermediate = (parameters.plus2 ? fraction3Intermediate.numerator.add(fraction4Intermediate.numerator) : fraction3Intermediate.numerator.subtract(fraction4Intermediate.numerator)).divide(fraction3Intermediate.denominator).combine()
		const intermediate = numeratorIntermediate.divide(denominatorIntermediate)
		const intermediateFlipped = intermediate.numerator.multiply(intermediate.denominator.invert())
		const intermediateMerged = intermediateFlipped.flatten(['mergeFractionProducts'])
		const ans = asExpression(`((${parameters.a / gcdValue}x ${parameters.plus1 ? '+' : '-'} ${parameters.b / gcdValue}w)yz)/(wx(${parameters.c / gcdValue}z ${parameters.plus2 ? '+' : '-'} ${parameters.d / gcdValue}y))`).substitute(variables).removeTrivial(['sortProducts'])
		return { ...parameters, variables, fraction1, fraction2, fraction3, fraction4, numerator, denominator, expression, gcdValue, fraction1Intermediate, fraction2Intermediate, fraction3Intermediate, fraction4Intermediate, numeratorSplit, denominatorSplit, numeratorIntermediate, denominatorIntermediate, intermediate, intermediateFlipped, intermediateMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('numeratorIntermediate', data)
			case 2: return compare('denominatorIntermediate', data)
			default: return compare('ans', data)
		}
	},
})

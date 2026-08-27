import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { hasSumWithinProduct, hasSimilarTerms, isFractionLike, hasFractionWithinFraction } = expressionChecks
const { areEquivalent, areEqualExceptOrder } = expressionComparisons

// (a*(x+b))/(e*x+f) +/- (c*x+d)/(e*x+f).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

export default buildStepExercise({
	metadata: {
		skill: 'addLikeFractionsWithVariables',
		...createStepExerciseMetadata([undefined, 'expandBrackets', 'mergeSimilarTerms']),
		comparisons: {
			singleFraction: (input: Expression, correct: Expression) => input.flatten().isFraction() && !hasFractionWithinFraction(input) && areEquivalent(input, correct),
			bracketsExpanded: (input: Expression, correct: Expression) => input.flatten().isFraction() && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && areEquivalent(input, correct),
			ans: (input: Expression, correct: Expression) => isFractionLike(input) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && areEquivalent(input, correct),
		},
	},

	generateParameters(example) {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [0] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const d = randomInteger(-8, 8, { exclude: [0] })
		const e = randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] })
		const f = example ? 0 : randomInteger(-8, 8, { exclude: [0] })
		return {
			x: sample(variableSet),
			a, b, c, d, e, f,
			switch: randomBoolean(),
			plus: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const fractions = ['(a*(x+b))/(ex+f)', '(c*x+d)/(e*x+f)'].map(str => asExpression(str, { interpretEAsConstant: false }).substitute(variables).removeTrivial([], ['combineMinusSignsInFractions']))
		const expression = (parameters.plus ? fractions[parameters.switch ? 1 : 0].add(fractions[parameters.switch ? 0 : 1]) : fractions[parameters.switch ? 1 : 0].subtract(fractions[parameters.switch ? 0 : 1])).removeTrivial([], ['combineMinusSignsInFractions'])
		const singleFraction = (parameters.plus ? fractions[parameters.switch ? 1 : 0].numerator.add(fractions[parameters.switch ? 0 : 1].numerator) : fractions[parameters.switch ? 1 : 0].numerator.subtract(fractions[parameters.switch ? 0 : 1].numerator)).divide(fractions[0].denominator).removeTrivial()
		const bracketsExpanded = singleFraction.removeTrivial(['expandProductsOfSums', 'combineNumbersInProducts'])
		const ans = bracketsExpanded.cancel(['combineLikeTerms'])
		const ansCleaned = ans.combine()
		const isFurtherSimplificationPossible = !areEqualExceptOrder(ans, ansCleaned)
		return { ...parameters, variables, expression, singleFraction, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('singleFraction', data)
			case 2: return compareInputs('bracketsExpanded', data)
			default: return compareInputs('ans', data)
		}
	},
})

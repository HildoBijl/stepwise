import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { hasSumWithinProduct, hasSimilarTerms, isFractionLike, hasFractionWithinFraction } = expressionChecks
const { areEquivalent, onlyOrderChanges } = expressionComparisons

// (a*x*(x+b))/(fx) +/- (c*x^2+d*x+e)/(fx).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

export default buildStepExercise({
	metadata: {
		skill: 'addLikeFractionsWithVariables',
		...createStepExerciseMetadata([undefined, 'expandBrackets', 'mergeSimilarTerms']),
		comparisons: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && areEquivalent(input, correct),
			bracketsExpanded: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && areEquivalent(input, correct),
			ans: (input: Expression, correct: Expression) => isFractionLike(input) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && areEquivalent(input, correct),
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [0] })
		const c = randomInteger(-3, 3, { exclude: [0] })
		const d = randomInteger(-8, 8, { exclude: [0] })
		const e = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const f = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		return {
			x: sample(variableSet),
			a, b, c, d, e, f,
			switch: randomBoolean(),
			plus: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const fractions = ['(a*x*(x+b))/(fx)', '(c*x^2+d*x+e)/(f*x)'].map(str => asExpression(str, { interpretEAsConstant: false }).substitute(variables).removeTrivial([], ['combineMinusSignsInFractions']))
		const expression = (parameters.plus ? fractions[parameters.switch ? 1 : 0].add(fractions[parameters.switch ? 0 : 1]) : fractions[parameters.switch ? 1 : 0].subtract(fractions[parameters.switch ? 0 : 1])).removeTrivial([], ['combineMinusSignsInFractions'])
		const singleFraction = (parameters.plus ? fractions[parameters.switch ? 1 : 0].numerator.add(fractions[parameters.switch ? 0 : 1].numerator) : fractions[parameters.switch ? 1 : 0].numerator.subtract(fractions[parameters.switch ? 0 : 1].numerator)).divide(fractions[0].denominator).removeTrivial([], ['combineMinusSignsInFractions'])
		const bracketsExpanded = singleFraction.removeTrivial(['expandProductsOfSums', 'combineLikeFactors', 'combineNumbersInProducts'], ['combineMinusSignsInFractions']).mapEvery(child => child.isPower() ? child.combine() : child)
		const ans = bracketsExpanded.cancel(['combineLikeTerms'], ['factorMinusSignsOutOfFractionSums', 'combineMinusSignsInFractions'])
		const ansCleaned = ans.normalize()
		const isFurtherSimplificationPossible = !onlyOrderChanges(ans, ansCleaned)
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

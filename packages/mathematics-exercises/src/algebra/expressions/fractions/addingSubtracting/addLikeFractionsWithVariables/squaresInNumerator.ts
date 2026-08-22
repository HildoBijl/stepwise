import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasSumWithinProduct, hasSimilarTerms, isFractionLike, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*x*(x+b))/(fx) +/- (c*x^2+d*x+e)/(fx).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

export default buildStepExercise({
	metaData: {
		skill: 'addLikeFractionsWithVariables',
		...createStepExerciseMetadata([undefined, 'expandBrackets', 'mergeSimilarTerms']),
		compare: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
			bracketsExpanded: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => isFractionLike(input) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && equivalent(input, correct),
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
		const variables = filterVariables(parameters, usedVariables, constants)
		const fractions = ['(a*x*(x+b))/(fx)', '(c*x^2+d*x+e)/(f*x)'].map(str => asExpression(str, { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses']))
		const expression = (parameters.plus ? fractions[parameters.switch ? 1 : 0].add(fractions[parameters.switch ? 0 : 1]) : fractions[parameters.switch ? 1 : 0].subtract(fractions[parameters.switch ? 0 : 1])).removeTrivial([], ['mergeFractionMinuses'])
		const singleFraction = (parameters.plus ? fractions[parameters.switch ? 1 : 0].numerator.add(fractions[parameters.switch ? 0 : 1].numerator) : fractions[parameters.switch ? 1 : 0].numerator.subtract(fractions[parameters.switch ? 0 : 1].numerator)).divide(fractions[0].denominator).removeTrivial([], ['mergeFractionMinuses'])
		const bracketsExpanded = singleFraction.removeTrivial(['expandProductsOfSums', 'mergeProductFactors', 'mergeProductNumbers'], ['mergeFractionMinuses']).mapEvery(child => child.isPower() ? child.combine() : child)
		const ans = bracketsExpanded.cancel(['groupSumTerms'], ['mergeFractionSumMinuses', 'mergeFractionMinuses'])
		const ansCleaned = ans.normalize()
		const isFurtherSimplificationPossible = !onlyOrderChanges(ans, ansCleaned)
		return { ...parameters, variables, expression, singleFraction, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('singleFraction', data)
			case 2: return compare('bracketsExpanded', data)
			default: return compare('ans', data)
		}
	},
})

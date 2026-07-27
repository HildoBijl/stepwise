import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '../../../../../generationTools'

const { hasSumWithinProduct, hasSimilarTerms, isFractionLike, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+b))/(e*x+f) +/- (c*x+d)/(e*x+f).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

export default buildStepExercise({
	metaData: {
		skill: 'addLikeFractionsWithVariables',
		...stepsToSetup([undefined, 'expandBrackets', 'mergeSimilarTerms']),
		compare: {
			singleFraction: (input: Expression, correct: Expression) => input.flatten().isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
			bracketsExpanded: (input: Expression, correct: Expression) => input.flatten().isFraction() && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => isFractionLike(input) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && equivalent(input, correct),
		},
	},

	generateState(example) {
		const a = getRandomInteger(-8, 8, [-1, 0, 1])
		const b = getRandomInteger(-8, 8, [0])
		const c = getRandomInteger(-8, 8, [-1, 0, 1])
		const d = getRandomInteger(-8, 8, [0])
		const e = getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1])
		const f = example ? 0 : getRandomInteger(-8, 8, [0])
		return {
			x: sample(variableSet),
			a, b, c, d, e, f,
			switch: getRandomBoolean(),
			plus: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const fractions = ['(a*(x+b))/(ex+f)', '(c*x+d)/(e*x+f)'].map(str => asExpression(str, { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses']))
		const expression = (state.plus ? fractions[state.switch ? 1 : 0].add(fractions[state.switch ? 0 : 1]) : fractions[state.switch ? 1 : 0].subtract(fractions[state.switch ? 0 : 1])).removeTrivial([], ['mergeFractionMinuses'])
		const singleFraction = (state.plus ? fractions[state.switch ? 1 : 0].numerator.add(fractions[state.switch ? 0 : 1].numerator) : fractions[state.switch ? 1 : 0].numerator.subtract(fractions[state.switch ? 0 : 1].numerator)).divide(fractions[0].denominator).removeTrivial()
		const bracketsExpanded = singleFraction.removeTrivial(['expandProductsOfSums', 'mergeProductNumbers'])
		const ans = bracketsExpanded.cancel(['groupSumTerms'])
		const ansCleaned = ans.combine()
		const isFurtherSimplificationPossible = !onlyOrderChanges(ans, ansCleaned)
		return { ...state, variables, expression, singleFraction, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('singleFraction', data)
			case 2: return compare('bracketsExpanded', data)
			default: return compare('ans', data)
		}
	},
})

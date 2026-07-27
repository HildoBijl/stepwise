import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx+d) = acx^2 + (ad+bc)x + bd
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'expandDoubleBrackets',
		...stepsToSetup(['expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
		compare: {
			firstExpanded: (input: Expression, correct: Expression, { factor2 }: { factor2: Expression }) => !input.some(term => term.isProduct() && term.some(factor => factor.isSum() && !equivalent(factor, factor2))) && equivalent(input, correct),
			allExpanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateState() {
		return {
			x: sample(variableSet),
			a: getRandomInteger(2, 6),
			b: getRandomInteger(2, 6),
			c: getRandomInteger(2, 6),
			d: getRandomInteger(2, 6),
			xFirst: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor1 = asExpression(state.xFirst ? 'a*x+b' : 'b+a*x').substitute(variables).removeTrivial()
		const factor2 = asExpression(state.xFirst ? 'c*x+d' : 'd+c*x').substitute(variables).removeTrivial()
		const expression = factor1.multiply(factor2).flatten()
		const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
		const ans = allExpanded.combine()
		const xFactors = allExpanded.terms.filter(term => term.isProduct() && term.factors.some(factor => variables.x.equalStructure(factor)))
		const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
		return { ...state, variables, factor1, factor2, expression, firstExpanded, allExpanded, ans, xFactors, xFactorsMerged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('firstExpanded', data)
			case 2: return compare('allExpanded', data)
			default: return compare('ans', data)
		}
	},
})

import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx^2+dx+e) = ...
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'f']

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
			a: getRandomInteger(-8, 8, [0]),
			b: getRandomInteger(-8, 8, [0]),
			c: getRandomInteger(-8, 8, [0]),
			d: getRandomInteger(-8, 8, [0]),
			f: getRandomInteger(-8, 8, [0]),
			switch: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor1 = asExpression(state.switch ? 'a*x+b' : 'b+a*x').substitute(variables).removeTrivial()
		const factor2 = asExpression(state.switch ? 'c*x^2+d*x+f' : 'f+d*x+c*x^2').substitute(variables).removeTrivial()
		const expression = factor1.multiply(factor2).flatten()
		const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
		const ans = allExpanded.combine()
		const hasFactor = (term: Expression, factor: Expression): boolean => term.equalStructure(factor) || (term.isProduct() && term.factors.some(termFactor => termFactor.equalStructure(factor))) || (term.isMinus() && hasFactor(term.argument, factor))
		const xFactors1 = allExpanded.terms.filter(term => hasFactor(term, variables.x))
		const xFactors2 = allExpanded.terms.filter(term => hasFactor(term, variables.x.toPower(2)))
		const xFactors1Merged = xFactors1[0].add(xFactors1[1]).normalize()
		const xFactors2Merged = xFactors2[0].add(xFactors2[1]).normalize()
		return { ...state, variables, factor1, factor2, expression, firstExpanded, allExpanded, ans, xFactors1, xFactors2, xFactors1Merged, xFactors2Merged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('firstExpanded', data)
			case 2: return compare('allExpanded', data)
			default: return compare('ans', data)
		}
	},
})

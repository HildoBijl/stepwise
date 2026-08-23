import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx^2+dx+e) = ...
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'f']

export default buildStepExercise({
	metadata: {
		skill: 'expandDoubleBrackets',
		...createStepExerciseMetadata(['expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
		compare: {
			firstExpanded: (input: Expression, correct: Expression, { factor2 }: { factor2: Expression }) => !input.some(term => term.isProduct() && term.some(factor => factor.isSum() && !equivalent(factor, factor2))) && equivalent(input, correct),
			allExpanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateParameters() {
		return {
			x: sample(variableSet),
			a: randomInteger(-8, 8, { exclude: [0] }),
			b: randomInteger(-8, 8, { exclude: [0] }),
			c: randomInteger(-8, 8, { exclude: [0] }),
			d: randomInteger(-8, 8, { exclude: [0] }),
			f: randomInteger(-8, 8, { exclude: [0] }),
			switch: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const factor1 = asExpression(parameters.switch ? 'a*x+b' : 'b+a*x').substitute(variables).removeTrivial()
		const factor2 = asExpression(parameters.switch ? 'c*x^2+d*x+f' : 'f+d*x+c*x^2').substitute(variables).removeTrivial()
		const expression = factor1.multiply(factor2).flatten()
		const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
		const ans = allExpanded.combine()
		const hasFactor = (term: Expression, factor: Expression): boolean => term.equalStructure(factor) || (term.isProduct() && term.factors.some(termFactor => termFactor.equalStructure(factor))) || (term.isMinus() && hasFactor(term.argument, factor))
		const xFactors1 = allExpanded.terms.filter(term => hasFactor(term, variables.x))
		const xFactors2 = allExpanded.terms.filter(term => hasFactor(term, variables.x.toPower(2)))
		const xFactors1Merged = xFactors1[0].add(xFactors1[1]).normalize()
		const xFactors2Merged = xFactors2[0].add(xFactors2[1]).normalize()
		return { ...parameters, variables, factor1, factor2, expression, firstExpanded, allExpanded, ans, xFactors1, xFactors2, xFactors1Merged, xFactors2Merged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('firstExpanded', data)
			case 2: return compareInputs('allExpanded', data)
			default: return compareInputs('ans', data)
		}
	},
})

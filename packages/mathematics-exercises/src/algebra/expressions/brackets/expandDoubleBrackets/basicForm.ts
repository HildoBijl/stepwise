import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx+d) = acx^2 + (ad+bc)x + bd
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'expandDoubleBrackets',
		...createStepExerciseMetadata(['expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
		comparisons: {
			firstExpanded: (input: Expression, correct: Expression, { factor2 }: { factor2: Expression }) => !input.some(term => term.isProduct() && term.some(factor => factor.isSum() && !equivalent(factor, factor2))) && equivalent(input, correct),
			allExpanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateParameters() {
		return {
			x: sample(variableSet),
			a: randomInteger(2, 6),
			b: randomInteger(2, 6),
			c: randomInteger(2, 6),
			d: randomInteger(2, 6),
			xFirst: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor1 = asExpression(parameters.xFirst ? 'a*x+b' : 'b+a*x').substitute(variables).removeTrivial()
		const factor2 = asExpression(parameters.xFirst ? 'c*x+d' : 'd+c*x').substitute(variables).removeTrivial()
		const expression = factor1.multiply(factor2).flatten()
		const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
		const ans = allExpanded.combine()
		const xFactors = allExpanded.terms.filter(term => term.isProduct() && term.factors.some(factor => variables.x.equalStructure(factor)))
		const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
		return { ...parameters, variables, factor1, factor2, expression, firstExpanded, allExpanded, ans, xFactors, xFactorsMerged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('firstExpanded', data)
			case 2: return compareInputs('allExpanded', data)
			default: return compareInputs('ans', data)
		}
	},
})

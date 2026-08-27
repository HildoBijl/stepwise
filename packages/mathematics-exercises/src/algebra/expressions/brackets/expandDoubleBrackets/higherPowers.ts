import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax^p+bx^q)(cx^r+dx^s) = ...
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

export default buildStepExercise({
	metadata: {
		skill: 'expandDoubleBrackets',
		...createStepExerciseMetadata(['expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
		comparisons: {
			firstExpanded: (input: Expression, correct: Expression, { factor2 }: { factor2: Expression }) => !input.some(term => term.isProduct() && term.some(factor => factor.isSum() && !areEquivalent(factor, factor2))) && areEquivalent(input, correct),
			allExpanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && areEquivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const p = randomInteger(1, 4)
			const q = randomInteger(0, 3, { exclude: [p] })
			const s = randomInteger(0, 3, { exclude: [q] })
			const r = p + s - q
			if (r < 0 || r > 4) continue
			return {
				x: sample(variableSet),
				a: randomInteger(-8, 8, { exclude: [0] }),
				b: randomInteger(-8, 8, { exclude: [0] }),
				c: randomInteger(-8, 8, { exclude: [0] }),
				d: randomInteger(-8, 8, { exclude: [0] }),
				p, q, r, s,
				switch: randomBoolean(),
			}
		}
		throw new Error('Failed to generate valid higher-power bracket parameters after 100 attempts.')
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor1 = asExpression(parameters.switch ? 'a*x^p+b*x^q' : 'b*x^q+a*x^p').substitute(variables).removeTrivial()
		const factor2 = asExpression(parameters.switch ? 'c*x^r+d*x^s' : 'd*x^s+c*x^r').substitute(variables).removeTrivial()
		const expression = factor1.multiply(factor2).flatten()
		const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'combineLikeFactors'])
		const jointFactor = asExpression('x^(q+r)').substitute(variables).normalize()
		const ans = allExpanded.combine()
		const xFactors = allExpanded.terms.filter(term => term.some(factor => variables.x.toPower(parameters.q + parameters.r).equalStructure(factor)))
		const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
		return { ...parameters, variables, factor1, factor2, expression, firstExpanded, allExpanded, jointFactor, ans, xFactors, xFactorsMerged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('firstExpanded', data)
			case 2: return compareInputs('allExpanded', data)
			default: return compareInputs('ans', data)
		}
	},
})

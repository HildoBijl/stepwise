import { sample, randomInteger, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, areEqualExceptOrder } = expressionComparisons
const { hasSumWithinProduct, hasSumWithinPowerBase } = expressionChecks

// (ax^p+bx^q)^2
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'p', 'q']

export default buildStepExercise({
	metadata: {
		skill: 'expandDoubleBrackets',
		...createStepExerciseMetadata(['rewritePower', 'expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
		comparisons: {
			multiplication: (input: Expression, correct: Expression) => !input.some(factor => factor.isPower() && factor.base.isSum()) && areEquivalent(input, correct),
			firstExpanded: (input: Expression, correct: Expression) => !input.some(term => term.isProduct() && count(term.factors, factor => factor.isSum()) > 1) && areEquivalent(input, correct),
			allExpanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && !hasSumWithinPowerBase(input) && areEquivalent(input, correct),
			ans: areEqualExceptOrder,
		},
	},

	generateParameters() {
		const p = randomInteger(0, 3)
		const q = randomInteger(0, 3, { exclude: [p] })
		return {
			x: sample(variableSet),
			a: randomInteger(-8, 8, { exclude: [0] }),
			b: randomInteger(-8, 8, { exclude: [0] }),
			p, q,
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor = asExpression('a*x^p+b*x^q').substitute(variables).removeTrivial()
		const expression = factor.toPower(2)
		const multiplication = factor.multiply(factor).flatten()
		const firstExpanded = factor.terms[0].multiply(factor).add(factor.terms[1].multiply(factor)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'combineLikeFactors'])
		const jointFactor = asExpression('x^(p+q)').substitute(variables).normalize()
		const ans = allExpanded.combine()
		const xPowerToMerge = variables.x.toPower(parameters.p + parameters.q).mergeNumbers()
		const hasXPowerToMerge = (term: Expression): boolean => term.equalStructure(xPowerToMerge) || (term.isProduct() && term.factors.some(factor => factor.equalStructure(xPowerToMerge))) || (term.isMinus() && hasXPowerToMerge(term.argument))
		const xFactors = allExpanded.terms.filter(term => hasXPowerToMerge(term))
		const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
		return { ...parameters, variables, factor, expression, multiplication, firstExpanded, allExpanded, jointFactor, ans, xFactors, xFactorsMerged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('multiplication', data)
			case 2: return compareInputs('firstExpanded', data)
			case 3: return compareInputs('allExpanded', data)
			default: return compareInputs('ans', data)
		}
	},
})

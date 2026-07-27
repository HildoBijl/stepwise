import { sample, getRandomInteger, count } from '@step-wise/utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '../../../../generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct, hasSumWithinPowerBase } = expressionChecks

// (ax^p+bx^q)^2
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'p', 'q']

export default buildStepExercise({
	metaData: {
		skill: 'expandDoubleBrackets',
		...stepsToSetup(['rewritePower', 'expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
		compare: {
			multiplication: (input: Expression, correct: Expression) => !input.some(factor => factor.isPower() && factor.base.isSum()) && equivalent(input, correct),
			firstExpanded: (input: Expression, correct: Expression) => !input.some(term => term.isProduct() && count(term.factors, factor => factor.isSum()) > 1) && equivalent(input, correct),
			allExpanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && !hasSumWithinPowerBase(input) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateState() {
		const p = getRandomInteger(0, 3)
		const q = getRandomInteger(0, 3, [p])
		return {
			x: sample(variableSet),
			a: getRandomInteger(-8, 8, [0]),
			b: getRandomInteger(-8, 8, [0]),
			p, q,
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor = asExpression('a*x^p+b*x^q').substitute(variables).removeTrivial()
		const expression = factor.toPower(2)
		const multiplication = factor.multiply(factor).flatten()
		const firstExpanded = factor.terms[0].multiply(factor).add(factor.terms[1].multiply(factor)).flatten()
		const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
		const jointFactor = asExpression('x^(p+q)').substitute(variables).normalize()
		const ans = allExpanded.combine()
		const xPowerToMerge = variables.x.toPower(state.p + state.q).mergeNumbers()
		const hasXPowerToMerge = (term: Expression): boolean => term.equalStructure(xPowerToMerge) || (term.isProduct() && term.factors.some(factor => factor.equalStructure(xPowerToMerge))) || (term.isMinus() && hasXPowerToMerge(term.argument))
		const xFactors = allExpanded.terms.filter(term => hasXPowerToMerge(term))
		const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
		return { ...state, variables, factor, expression, multiplication, firstExpanded, allExpanded, jointFactor, ans, xFactors, xFactorsMerged }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('multiplication', data)
			case 2: return compare('firstExpanded', data)
			case 3: return compare('allExpanded', data)
			default: return compare('ans', data)
		}
	},
})

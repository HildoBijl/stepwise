import { sample, randomInteger, randomBoolean, repeat, randomIndices } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (a*x+b)/(c*x+d) +/- (e*x+f)/(g*x+h).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export default buildStepExercise({
	metadata: {
		skill: 'addFractionsWithVariables',
		...createStepExerciseMetadata(['cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables']),
		compare: {
			sameDenominator: (input: Expression, correct: Expression) => {
				if (!input.isSum() || input.terms.length !== 2) return false
				const fractions = input.terms.map(term => term.find(part => part.isFraction()))
				return fractions.every(fraction => fraction?.isFraction()) && equivalent(fractions[0]!.denominator, fractions[1]!.denominator) && equivalent(input, correct)
			},
			bracketsExpanded: (input: Expression, correct: Expression) => {
				if (!input.isSum() || input.terms.length !== 2) return false
				const fractions = input.terms.map(term => term.find(part => part.isFraction()))
				return fractions.every(fraction => fraction?.isFraction()) && equivalent(fractions[0]!.denominator, fractions[1]!.denominator) && fractions.every(fraction => onlyOrderChanges(fraction!.numerator.flatten(), fraction!.numerator.cancel(['expandProductsOfSums', 'groupSumTerms']))) && equivalent(input, correct)
			},
			ans: (input: Expression, correct: Expression) => {
				const flattened = input.flatten()
				return flattened.isFractionLike() && !hasFractionWithinFraction(input) && onlyOrderChanges(flattened.numerator, flattened.numerator.cancel(['expandProductsOfSums', 'mergeProductFactors', 'groupSumTerms'])) && equivalent(input, correct)
			},
		},
	},

	generateParameters() {
		const parameters = repeat(8, index => randomInteger(index % 2 === 0 ? 2 : -8, 8, { exclude: [-1, 0, 1] }))
		const deactivate = randomIndices(3, { count: 2 }).map(index => [0, 1, 3][index])
		parameters[deactivate[0]] = 0
		parameters[deactivate[1] + 4] = 0
		const [a, b, c, d, e, f, g, h] = parameters
		return {
			x: sample(variableSet),
			a, b, c, d, e, f, g, h,
			plus: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const fractions = ['(a*x+b)/(c*x+d)', '(e*x+f)/(g*x+h)'].map(str => asExpression(str, { eAsConstant: false }).substitute(variables).removeTrivial())
		const joinFractions = (items: Expression[]) => items[0].add(parameters.plus ? items[1] : items[1].negate()).removeTrivial()
		const expression = joinFractions(fractions)
		const fractionsWithSameDenominator = fractions.map((fraction, index) => multiplyNumeratorAndDenominator(fraction, fractions[1 - index].denominator, index === 1))
		const sameDenominator = joinFractions(fractionsWithSameDenominator)
		const fractionsWithBracketsExpanded = fractionsWithSameDenominator.map(fraction => fraction.mapNumerator(numerator => numerator.cancel(['expandProductsOfSums', 'mergeProductFactors', 'groupSumTerms'])))
		const bracketsExpanded = joinFractions(fractionsWithBracketsExpanded)
		const ans = bracketsExpanded.cancel(['mergeFractionSums', 'mergeFractionProducts', 'sortProducts']).mapNumerator(numerator => numerator.cancel(['expandProductsOfSums', 'groupSumTerms', 'sortSums']))
		const ansCleaned = ans.normalize([], ['applyPolynomialCancellation', 'expandProductsOfSums'])
		const isFurtherSimplificationPossible = !onlyOrderChanges(ans, ansCleaned)
		return { ...parameters, variables, fractions, expression, sameDenominator, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('sameDenominator', data)
			case 2: return compareInputs('bracketsExpanded', data)
			default: return compareInputs('ans', data)
		}
	},
})

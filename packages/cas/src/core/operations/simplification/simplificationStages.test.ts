import { type ExpressionNode } from '../../construction/index.ts'

import { defineRule, simplificationRules } from './rules/index.ts'
import { normalizationRequirementRules } from './rules/normalization/index.ts'
import { resolveSimplificationOptions, resolveSimplificationRules } from './simplificationOptions/index.ts'
import { resolveSimplificationStages } from './simplify.ts'

const firstRule = defineRule({
	name: 'firstRule',
	appliesTo: (node): node is ExpressionNode => true,
	transform: node => node,
})
const secondRule = defineRule({
	name: 'secondRule',
	appliesTo: (node): node is ExpressionNode => true,
	transform: node => node,
	after: [firstRule],
})

describe('simplification stages', () => {
	test('puts selected rules without after constraints in one stage', () => {
		const options = new Set(['flattenSums', 'flattenProducts'] as const)
		const rules = resolveSimplificationRules(resolveSimplificationOptions(options))
		expect(resolveSimplificationStages(rules)).toEqual([new Set([simplificationRules.flattenSums, simplificationRules.flattenProducts])])
	})

	test('does not create a stage when no rules are selected', () => {
		expect(resolveSimplificationStages(new Set())).toEqual([])
	})

	test('creates cumulative stages from rule references', () => {
		expect(resolveSimplificationStages(new Set([firstRule, secondRule]))).toEqual([
			new Set([firstRule]),
			new Set([firstRule, secondRule]),
		])
	})

	test('ignores after rules that were not selected', () => {
		expect(resolveSimplificationStages(new Set([secondRule]))).toEqual([new Set([secondRule])])
	})

	test('reduces fraction factors before expanding sums', () => {
		const { cancelFractionFactors, combineFractionFactors, expandProductsOfSums, expandPowersOfSums } = simplificationRules
		const reductionStage = new Set([cancelFractionFactors, combineFractionFactors])
		const expansionStage = new Set([...reductionStage, expandProductsOfSums, expandPowersOfSums])
		expect(resolveSimplificationStages(expansionStage)).toEqual([reductionStage, expansionStage])
	})

	test('applies polynomial cancellation after its normalization requirements', () => {
		const requirementStage = new Set(normalizationRequirementRules)
		const polynomialStage = new Set([...requirementStage, simplificationRules.cancelPolynomialFactors])
		const stages = resolveSimplificationStages(polynomialStage)
		expect(stages.slice(0, -1)).toEqual(resolveSimplificationStages(requirementStage))
		expect(stages[stages.length - 1]).toEqual(polynomialStage)
	})
})

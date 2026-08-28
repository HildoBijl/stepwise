import { type ExpressionNode } from '../../../construction/index.ts'

import { allSimplificationOptions, resolveSimplificationStages } from '..'

import { defineRule, defineRuleRegistry, mergeRuleRegistries, simplificationRules } from '.'
import { structuralRules } from './structural/index.ts'
import { numericRules } from './numeric/index.ts'
import { cancellationRules } from './cancellation/index.ts'
import { rewritingRules } from './rewriting/index.ts'
import { combinationRules } from './combination/index.ts'
import { expansionRules } from './expansion/index.ts'
import { factorizationRules } from './factorization/index.ts'
import { normalizationRules } from './normalization/index.ts'

const exampleRule = defineRule({
	name: 'exampleRule',
	appliesTo: (node): node is ExpressionNode => true,
	transform: node => node,
})

describe('simplification rule registries', () => {
	test('uses rule names as registry keys', () => {
		expect(defineRuleRegistry(exampleRule)).toEqual({ exampleRule })
		for (const [name, rule] of Object.entries(simplificationRules)) expect(rule.name).toBe(name)
	})

	test('derives all public simplification options from the registry', () => {
		expect(allSimplificationOptions).toEqual(new Set(Object.keys(simplificationRules)))
	})

	test('rejects duplicate rule names when defining or merging registries', () => {
		expect(() => defineRuleRegistry(exampleRule, exampleRule)).toThrow('Duplicate simplification rule name "exampleRule"')
		const registry = defineRuleRegistry(exampleRule)
		expect(() => mergeRuleRegistries(registry, registry)).toThrow('Duplicate simplification rule name "exampleRule"')
	})

	test('only references dependencies from the same or an earlier rule group', () => {
		const groups = [structuralRules, numericRules, cancellationRules, rewritingRules, combinationRules, expansionRules, factorizationRules, normalizationRules]
		const groupByRule = new Map(groups.flatMap((group, index) => Object.values(group).map(rule => [rule, index] as const)))
		for (const [rule, groupIndex] of groupByRule) {
			for (const dependency of [...rule.requires ?? [], ...rule.conflictsWith ?? [], ...rule.after ?? []]) {
				expect(groupByRule.get(dependency)).toBeLessThanOrEqual(groupIndex)
			}
		}
	})

	test('does not contain cycles in after constraints', () => {
		expect(() => resolveSimplificationStages(new Set(Object.values(simplificationRules)))).not.toThrow()
	})
})

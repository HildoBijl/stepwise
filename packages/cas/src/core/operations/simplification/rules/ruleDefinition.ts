import { type ExpressionNode } from '../../../construction/index.ts'

import { type AnySimplificationRule, type MergedRegistries, type RegistryFromRules, type SimplificationRule, type SimplificationRuleRegistry } from './types.ts'

export function defineRule<const Name extends string, Node extends ExpressionNode>(rule: SimplificationRule<Name, Node>): SimplificationRule<Name, Node> {
	return rule
}

export function defineRuleRegistry<const Rules extends readonly AnySimplificationRule[]>(...rules: Rules): RegistryFromRules<Rules> {
	const registry: Record<string, AnySimplificationRule> = {}
	for (const rule of rules) {
		if (registry[rule.name]) throw new Error(`Duplicate simplification rule name "${rule.name}".`)
		registry[rule.name] = rule
	}
	return registry as RegistryFromRules<Rules>
}

export function mergeRuleRegistries<const Registries extends readonly SimplificationRuleRegistry[]>(...registries: Registries): MergedRegistries<Registries> {
	const registry: Record<string, AnySimplificationRule> = {}
	for (const rules of registries) {
		for (const rule of Object.values(rules)) {
			if (registry[rule.name]) throw new Error(`Duplicate simplification rule name "${rule.name}".`)
			registry[rule.name] = rule
		}
	}
	return registry as MergedRegistries<Registries>
}

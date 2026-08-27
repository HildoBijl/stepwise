import { type ExpressionSettingsOptions, resolveExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, nodeToTree } from '../../construction'

import { mapNodes } from '../structural'

import { type SimplificationOptionsInput, resolveSimplificationOptions, resolveSimplificationRules, validateSimplificationOptions } from './simplificationOptions'
import { applySimplificationRules, type AnySimplificationRule, type SimplificationContext, type SimplificationRules } from './rules'

// Take some form of simplification option input, process/check it, and apply it to the node and its children.
export function simplify(node: ExpressionNode, settings?: ExpressionSettingsOptions, options?: SimplificationOptionsInput): ExpressionNode {
	const expressionSettings = resolveExpressionSettings(settings)
	const simplificationOptions = validateSimplificationOptions(resolveSimplificationOptions(options))
	return simplifyWithRules(node, expressionSettings, resolveSimplificationRules(simplificationOptions))
}

function simplifyWithRules(node: ExpressionNode, expressionSettings: ReturnType<typeof resolveExpressionSettings>, rules: SimplificationRules): ExpressionNode {
	let current = node
	for (const stage of resolveSimplificationStages(rules)) {
		const context: SimplificationContext = {
			simplificationRules: stage,
			expressionSettings,
			parents: [],
			simplify: (node, rules = stage) => simplifyWithRules(node, expressionSettings, rules),
		}
		current = simplifyUntilStable(current, context)
	}
	return current
}

// Group the selected options into cumulative stages based on their "after" constraints.
export function resolveSimplificationStages(rules: SimplificationRules): SimplificationRules[] {
	const rulesList = [...rules]
	const passedRules = new Set<AnySimplificationRule>()
	const stages: SimplificationRules[] = []
	while (passedRules.size < rules.size) {
		const availableRules = rulesList.filter(rule => !passedRules.has(rule)).filter(rule => (rule.after ?? []).filter(rule => rules.has(rule)).every(rule => passedRules.has(rule)))
		if (availableRules.length === 0) {
			const pendingRuleNames = new Set(rulesList.filter(rule => !passedRules.has(rule)).map(rule => rule.name))
			throw new Error(`Could not resolve simplification stages. The following rules have cyclic "after" constraints: ${JSON.stringify([...pendingRuleNames])}.`)
		}
		availableRules.forEach(rule => passedRules.add(rule))
		stages.push(new Set(passedRules))
	}
	return stages
}

// Repeat the simplification options until there are no more changes. Simplifications should stabilize.
function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 20; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error(`Simplification did not stabilize. Some of the simplification rules lock each other in an infinite loop.\nFinal expression: ${nodeToTree(current)}\nSimplifications used: ${JSON.stringify([...new Set([...context.simplificationRules].map(rule => rule.name))])}`)
}

// Run a set of simplification operations once on all nodes.
function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return mapNodes(node, (descendant, parents) => applySimplificationRules(descendant, { ...context, parents }), { childrenFirst: true })
}

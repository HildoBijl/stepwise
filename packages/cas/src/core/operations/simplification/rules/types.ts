import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction/index.ts'

export type SimplificationRule<Name extends string = string, Node extends ExpressionNode = ExpressionNode> = {
	name: Name
	appliesTo: (node: ExpressionNode, context: SimplificationContext) => node is Node
	transform: (node: Node, context: SimplificationContext) => ExpressionNode
	requires?: readonly AnySimplificationRule[]
	conflictsWith?: readonly AnySimplificationRule[]
	after?: readonly AnySimplificationRule[]
}

export type AnySimplificationRule = SimplificationRule<string, any>
export type SimplificationRules = ReadonlySet<AnySimplificationRule>
export type SimplifyWithRules = (node: ExpressionNode, rules?: SimplificationRules) => ExpressionNode
export type SimplificationContext = {
	simplificationRules: SimplificationRules
	expressionSettings: ExpressionSettings
	parents: readonly ExpressionNode[]
	simplify: SimplifyWithRules
}

export type SimplificationRuleRegistry = Readonly<Record<string, AnySimplificationRule>>
export type RegistryFromRules<Rules extends readonly AnySimplificationRule[]> = { [Rule in Rules[number]as Rule['name']]: Rule }
type UnionToIntersection<Union> = (Union extends unknown ? (value: Union) => void : never) extends (value: infer Intersection) => void ? Intersection : never
export type MergedRegistries<Registries extends readonly SimplificationRuleRegistry[]> = UnionToIntersection<Registries[number]>

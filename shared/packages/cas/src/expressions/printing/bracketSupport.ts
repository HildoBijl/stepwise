import { ExpressionNode, Constant, PlusMinus, Sum, Product } from '../nodes'

// Define the various levels of operation urgency, to check if brackets are needed.
export const bracketLevels = {
	addition: 0,
	multiplication: 1,
	division: 2,
	powers: 3,
} as const
export type BracketLevel = typeof bracketLevels[keyof typeof bracketLevels]

// Describe whether an expression node requires brackets around it, given a certain operation and (if within an expression list: sum or products) at a certain place in the list.
export function requiresBracketsFor(node: ExpressionNode, level: BracketLevel, index?: number): boolean {
	if (node instanceof Constant) return node.value < 0 && level !== bracketLevels.addition && level !== bracketLevels.multiplication
	if (node instanceof PlusMinus) return level !== bracketLevels.addition
	if (node instanceof Sum) return level !== bracketLevels.addition
	if (node instanceof Product) return level === bracketLevels.division || level === bracketLevels.powers
	if (node instanceof Function) return level === bracketLevels.powers

	return false
}

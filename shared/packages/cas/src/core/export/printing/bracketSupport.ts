import { ExpressionNode } from '../../construction'
import { isConstantNode, isSign, isSum, isProduct, isFunctionNode } from '../../operations'

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
	if (isConstantNode(node)) return node.value < 0 && level !== bracketLevels.addition && level !== bracketLevels.multiplication
	if (isSign(node) && (node.negative || node.plusMinus)) return level !== bracketLevels.addition
	if (isSum(node)) return level !== bracketLevels.addition
	if (isProduct(node)) return level === bracketLevels.division || level === bracketLevels.powers
	if (isFunctionNode(node)) return level === bracketLevels.powers
	return false
}

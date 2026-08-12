import { ExpressionNode } from '../../construction'
import { isSignNode, isSum, isProduct, isFraction, isPower, isFunctionNode } from '../../operations'

// Define the various levels of operation urgency, to check if brackets are needed.
export const bracketLevels = {
	addition: 0,
	negation: 1,
	multiplication: 2,
	division: 3,
	powers: 4,
} as const
export type BracketLevel = typeof bracketLevels[keyof typeof bracketLevels]

// Describe whether an expression node requires brackets around it, given a certain operation and (if within an expression list: sum or products) at a certain place in the list.
export function requiresBracketsFor(node: ExpressionNode, level: BracketLevel, index = 0, length = 0): boolean {
	if (isSignNode(node)) return level === bracketLevels.multiplication || level === bracketLevels.negation || level === bracketLevels.division || level === bracketLevels.powers
	if (isSum(node)) return true
	if (isProduct(node)) return level === bracketLevels.multiplication || level === bracketLevels.division || level === bracketLevels.powers
	if (isFraction(node)) return (level === bracketLevels.division && index === 1) || level === bracketLevels.powers
	if (isPower(node)) return level === bracketLevels.powers
	if (isFunctionNode(node)) return level === bracketLevels.powers && index === 1
	return false
}

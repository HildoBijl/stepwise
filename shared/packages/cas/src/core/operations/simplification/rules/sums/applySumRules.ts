// export function applySumRules(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
// 	if (!isSum(node)) return node

// 	if (context.options.flattenSums) node = flattenSums(node)
// 	if (context.options.removePlusZeroFromSums) node = removePlusZeroFromSums(node)
// 	if (context.options.mergeSumNumbers) node = mergeSumNumbers(node, context)
// 	// ...
// 	return node
// }

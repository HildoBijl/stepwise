import { randomSubset, fromKeys } from '@step-wise/utils'
import { type Expression, type ExpressionLike, asExpression } from '@step-wise/cas'

export function selectRandomVariables(availableVariables: readonly string[], usedVariables: readonly string[]): Record<string, Expression> {
	const chosenVariables = randomSubset(availableVariables, usedVariables.length)
	return fromKeys(usedVariables, (_, index) => asExpression(chosenVariables[index]))
}

export function filterVariables(state: Record<string, unknown>, usedVariables: readonly string[], constants: readonly string[] = []): Record<string, Expression> {
	const allNames = [...usedVariables, ...constants]
	return fromKeys(allNames, name => asExpression(state[name] as ExpressionLike))
}

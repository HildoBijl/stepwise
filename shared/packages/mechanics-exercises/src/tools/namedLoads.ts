import { type Expression, asExpression } from '@step-wise/cas'
import { type LoadName, createLoadName, getLoadNameSubscript } from '@step-wise/engineering-mechanics'

export function loadNameToVariable(name: LoadName): Expression {
	name = createLoadName(name)
	const subscript = getLoadNameSubscript(name)
	return asExpression(subscript === undefined ? name.symbol : `${name.symbol}_(${subscript})`)
}

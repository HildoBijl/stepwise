import { ExpressionNode, Integer, Float, PlusMinus, Variable, Sum, Product, Power } from '../nodes'

import { ExpressionNodeStorageValue } from './types'

export function storageValueToNode(storageValue: ExpressionNodeStorageValue): ExpressionNode {
	// Constants
	if (storageValue.subtype === 'Integer') return new Integer(storageValue.value)
	if (storageValue.subtype === 'Float') return new Float(storageValue.value)
	if (storageValue.subtype === 'PlusMinus') return new PlusMinus()

	// Variables
	if (storageValue.subtype === 'Variable') return new Variable(storageValue.symbol, storageValue.subscript, storageValue.accent)

	// Expression lists
	if (storageValue.subtype === 'Sum') return new Sum(storageValue.terms.map(storageValueToNode))
	if (storageValue.subtype === 'Product') return new Product(storageValue.terms.map(storageValueToNode))

	// Functions
	// if (storageValue.subtype in Object.keys(functionConstructors)) functionStorageValueToNode(storageValue)

	// Fallback
	throw new Error(`Cannot deserialize expression storage value: the subtype of "${JSON.stringify(storageValue)}" has no known deserialization method.`)
}

// Define the constructors of all the functions that we have.
// type FunctionConstructor = {
// 	new (...args: ExpressionNode[]): Function
// 	argumentNames: readonly string[]
// }
// const functionConstructors = {
// 	Power,
// 	// Fraction,
// 	// Root,
// 	// Sqrt,
// } satisfies Record<string, FunctionConstructor>

// export function functionStorageValueToNode(value: FunctionStorageValue): Function {
// 	const Constructor = functionConstructors[value.subtype]
// 	if (!Constructor) throw new Error(`Cannot deserialize function of subtype "${value.subtype}".`)
// 	const args = Constructor.argumentNames.map(name => {
// 		const arg = value[name]
// 		if (!arg || typeof arg === 'string') throw new Error(`Invalid function storage value: missing argument "${name}" for "${value.subtype}".`)
// 		return storageValueToNode(arg)
// 	})
// 	return new Constructor(...args)
// }

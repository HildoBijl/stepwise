// ToDo: fix this.

const { ensureExpressionStrict, expressionTypes, Integer } = require('../../functionalities/Expression')

function asExpression(str) {
	// Check the input type.
	if (typeof str !== 'string')
		throw new Error(`Invalid asExpression input: expected a string but recieved input of type "${str}".`)

	// ToDo
	return Integer.zero
}
module.exports.asExpression = asExpression

function ensureExpression(expression) {
	// First try the strict ensureExpression. If that one works, return the result.
	try {
		const expressionProcessed = ensureExpressionStrict(expression)
		if (expressionProcessed instanceof Expression)
			return expressionProcessed
	} catch {}

	// If it's a string, interpret it.
	if (typeof expression === 'string')
		return asExpression(expression)

	// The only option left is a raw object with a type parameter.
	if (!isObject(expression))
		throw new Error(`Invalid expression: received something that was supposedly an expression, but has type "${typeof expression}" and value "${JSON.stringify(expression)}".`)
	if (!expression.type)
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but it does not have a "type" property. Cannot interpret it.`)

	// Check the given type.
	if (!expressionTypes[expression.type])
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but its type "${expression.type}" is not known.`)

	// Pass the object to the right constructor.
	return new expressionTypes[obj.type](obj)
}
module.exports.ensureExpression = ensureExpression
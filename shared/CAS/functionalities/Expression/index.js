const { isObject } = require('./../../../util/objects')

const mainCAS = require('./Expression')
const functions = require('./functions')

// On top of exporting all Expression types, functions and options, also include an "expressionTypes" parameter containing only endpoints of the Expression tree. So it has no abstract classes, but only things that actually occur like Integer, Product, Power, Sin, etcetera.
const expressionTypes = {
	...mainCAS.expressionTypes,
	...functions,
}

module.exports = {
	...mainCAS, // Export all exports from the Expression file. This is the basic CAS functionality.
	...functions, // Export all functions too. These are add-on functionalities.
	expressionTypes,
}

// ensureExpression is an extended (improved) version of ensureExpression from the main CAS. It takes an object that may be an SO or an actual expression and ensures that it's an expression in functional form. It throws an error otherwise. It does not allow string conversion yet.
function ensureExpression(expression) {
	// First try the strict ensureExpression. If that one works, return the result.
	let expressionProcessed
	try { expressionProcessed = mainCAS.ensureExpression(expression) } catch {}
	if (expressionProcessed instanceof mainCAS.Expression)
		return expressionProcessed

	// If this is an SO, then it must be an object with a type parameter equal to an expression type.
	if (!isObject(expression))
		throw new Error(`Invalid expression: received something that was supposedly an expression, but has type "${typeof expression}" and value "${JSON.stringify(expression)}".`)
	if (!expression.type)
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but it does not have a "type" property. Cannot interpret it.`)
	if (!expressionTypes[expression.type])
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but its type "${expression.type}" is not known.`)

	// Pass the object to the right constructor.
	return new expressionTypes[expression.type](expression)
}
module.exports.ensureExpression = ensureExpression
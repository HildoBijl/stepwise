const { isObject, isBasicObject, applyMapping } = require('./../../../util')

const mainCAS = require('./Expression')
const functions = require('./functions')
const comparisons = require('./comparisons')
const checks = require('./checks')

// On top of exporting all Expression types, functions and options, also include an "expressionSubtypes" parameter containing only endpoints of the Expression tree. So it has no abstract classes, but only things that actually occur like Integer, Product, Power, Sin, etcetera.
const expressionSubtypes = {
	...mainCAS.expressionSubtypes,
	...functions,
}

module.exports = {
	...mainCAS, // Export all exports from the Expression file. This is the basic CAS functionality.
	...functions, // Export all functions too. These are add-on functionalities.
	expressionSubtypes,
	expressionComparisons: comparisons,
	expressionChecks: checks,
}

// ensureExpression is an extended (improved) version of ensureExpression from the main CAS. It takes an object that may be an SO or an actual expression and ensures that it's an expression in functional form. It throws an error otherwise. It does not allow string conversion yet.
function ensureExpression(expression) {
	// First try the strict ensureExpression. If that one works, return the result.
	let expressionProcessed
	try { expressionProcessed = mainCAS.ensureExpression(expression) } catch { }
	if (expressionProcessed instanceof mainCAS.Expression)
		return expressionProcessed

	// If it is an object, it is probably an SO. Try to interpret it.
	if (isObject(expression))
		return SOtoFO(expression)

	// No idea...
	throw new Error(`Invalid expression: received something that was supposedly an expression, but has type "${typeof expression}" and value "${JSON.stringify(expression)}".`)
}
module.exports.ensureExpression = ensureExpression

function SOtoFO(SO, loose = false) {
	// Check special cases.
	if (!isBasicObject(SO)) {
		// For the first object, this is not allowed.
		if (!loose)
			throw new Error(`Invalid Expression SO: expected an Expression SO, but received a parameter of type "${typeof SO}".`)

		// For arrays just apply to each element.
		if (Array.isArray(SO))
			return SO.map(value => SOtoFO(value, true))

		// For other parameters, just keep the parameter.
		return SO
	}

	// First walk through all children and see if we can turn them into FOs. This order is needed because this object itself (like a Product) might not know about the other objects (like Arcsin or so) and hence fail.
	SO = applyMapping(SO, param => SOtoFO(param, true))

	// Then try to turn this object into an FO based on the given subtype.
	const subtype = SO.subtype
	if (expressionSubtypes[subtype])
		return new expressionSubtypes[subtype](SO)

	// The subtype is not known. Is this the main call to this function? If so, something is wrong. Throw an error. Otherwise just return the object.
	if (!loose)
		throw new Error(`Invalid Expression type: received an Expression SO with subtype "${subtype}" but this was not a known Expression subtype.`)
	return SO
}

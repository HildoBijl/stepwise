const { isObject } = require('../../../util')

const SItoFO = require('./SItoFO')

function interpret(obj) {
	// Check the type.
	if (!isObject(obj))
		throw new Error(`Interpreting error: the expression interpret function was called but was not given an object. Instead, it was given "${obj}".`)
	if (obj.type !== 'Expression')
		throw new Error(`Interpreting error: the expression interpret function was called on an object of type "${obj.type}". This must be an Expression type.`)

	// Interpret the value.
	return SItoFO(obj.value, obj.settings)
}
module.exports = interpret

// This is the abstract FunctionSingleArgument class. It should not be instantiated, but it is used for single-argument functions like ln, sin, cos, etcetera.

const Parent = require('./FunctionMultiArgument')

const args = ['argument'] // Only use a single argument.

class FunctionSingleArgument extends Parent {
	// All the same as the multi-argument function.
}
FunctionSingleArgument.defaultSO = Parent.getDefaultSO(args)
FunctionSingleArgument.args = args
module.exports = FunctionSingleArgument
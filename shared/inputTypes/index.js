const mainFunctions = ['SItoFO', 'SOtoFO', 'FOtoSI']
function requireAndProcess(name) {
	const exports = { ...require(`./${name}`) }
	mainFunctions.forEach(mainFunction => {
		if (exports[mainFunction]) {
			exports[`${name}${mainFunction}`] = exports[mainFunction]
			delete exports[mainFunction]
		}
	})
	return exports
}

module.exports = {
	...require('./main'),

	// Basic types. Must be removed after input object legacy data is deleted.
	...requireAndProcess('Boolean'),
	...requireAndProcess('String'),

	// Number- and physics-based types.
	...requireAndProcess('Integer'),
	...requireAndProcess('Float'),
	...requireAndProcess('Unit'),
	...requireAndProcess('FloatUnit'),

	// Expression-based types.
	...requireAndProcess('Expression'),
	...requireAndProcess('Equation'),

	// Object-based types.
	...requireAndProcess('Vector'),
	...requireAndProcess('Span'),
}

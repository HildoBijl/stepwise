const mainFunctions = ['SItoFO', 'SOtoFO', 'FOtoSI']
function requireAndProcess(name) {
	const package = { ...require(`./${name}`) }
	mainFunctions.forEach(mainFunction => {
		if (package[mainFunction]) {
			package[`${name}${mainFunction}`] = package[mainFunction]
			delete package[mainFunction]
		}
	})
	return package
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

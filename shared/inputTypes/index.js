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

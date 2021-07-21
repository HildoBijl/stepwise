const functionList = ['Fraction', 'Power', 'Ln', 'Log', 'Sqrt', 'Root', 'Sin', 'Cos', 'Tan', 'Arcsin', 'Arccos', 'Arctan']

// Export all functions.
functionList.forEach(func => {
	module.exports[func] = require(`./${func}`)
})
const functionList = ['Fraction', 'Power', 'Ln', 'Log', 'Sqrt', 'Root', 'Sin', 'Cos', 'Tan', 'Asin', 'Acos', 'Atan']

// Export all functions.
functionList.forEach(func => {
	module.exports[func] = require(`./${func}`)
})
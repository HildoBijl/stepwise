const { epsilon } = require('../options')

// compare is used to compare two numbers for equality, given a defined error margin.
module.exports.compareNumbers = (a, b) => {
	if (Math.abs(a - b) < epsilon)
		return true
	if (Math.abs(b) > epsilon && Math.abs(a - b)/b < epsilon)
		return true
	return false
}
const { isNumber, ensureNumber } = require('./numbers')

// isInt checks if a given parameter is an integer. Strings of integers are allowed.
function isInt(value) {
	// Check boundary cases.
	if (Math.abs(value) === Infinity)
		return true

	// Do the general check.
	return isNumber(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) // eslint-disable-line eqeqeq
}
module.exports.isInt = isInt

// ensureInt ensures that the given value is an integer and throws an error otherwise. If it's a string number, like "3" then it turns it into an integer. If positive is set to true, it requires it to be positive (or zero) too. If nonzero is set to true, it may not be zero.
function ensureInt(x, positive = false, nonzero = false) {
	// Is it potentially an integer?
	if (!isInt(x))
		throw new Error(`Input error: the given value must be an integer, but received a parameter of type "${typeof x}" and value "${x}".`)

	// Approve of infinity before further processing. (Given the usual checks, which we relegate to ensureNumber.)
	if (Math.abs(x) === Infinity)
		return ensureNumber(x, positive, nonzero)

	// Ensure it's in integer form.
	x = parseInt(x)

	// Do potential extra checks.
	if (positive && x < 0)
		throw new Error(`Input error: the given value was negative, but it must be positive. "${x}" was received.`)
	if (nonzero && x === 0)
		throw new Error(`Input error: the given value was zero, but this is not allowed.`)

	// Return the processed result.
	return x
}
module.exports.ensureInt = ensureInt

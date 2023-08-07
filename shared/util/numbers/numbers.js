// isNumber checks if a given parameter is a number. Strings of numbers are allowed. Number-like objects are not.
function isNumber(value) {
  // Check boundary cases.
  if (typeof value === 'string' && value.trim() === '')
    return false
  if (typeof value === 'object')
    return false

  // Go for the default comparison.
  return !isNaN(value)
}
module.exports.isNumber = isNumber

// ensureNumber ensures that the given value is a number and throws an error otherwise. If it's a string number, like "3.14" then it turns it into a number. If positive is set to true, it requires it to be positive (or zero) too. If nonzero is set to true, it may not be zero.
function ensureNumber(x, positive = false, nonzero = false) {
  if (!isNumber(x))
    throw new Error(`Input error: the given value must be a number, but received a parameter of type "${typeof x}" and value "${x}".`)
  x = parseFloat(x)
  if (positive && x < 0)
    throw new Error(`Input error: the given value was negative, but it must be positive. "${x}" was received.`)
  if (nonzero && x === 0)
    throw new Error(`Input error: the given value was zero, but this is not allowed.`)
  return x
}
module.exports.ensureNumber = ensureNumber

// If the difference between two values is smaller than this, they are considered equal.
const epsilon = 1e-12
module.exports.epsilon = epsilon

// compareNumbers checks for two numbers if they are close enough (within margin epsilon, absolutely or relatively) to be considered equal.
function compareNumbers(a, b) {
  if (Math.abs(a - b) < epsilon)
    return true
  if (Math.abs(b) > epsilon && Math.abs((a - b) / b) < epsilon)
    return true
  return false
}
module.exports.compareNumbers = compareNumbers

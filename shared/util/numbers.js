const { lastOf } = require('./arrays')

// isNumber checks if a given parameter is a number. Strings of numbers are allowed.
function isNumber(value) {
  // Check boundary cases.
  if (typeof value === 'string' && value.trim() === '')
    return false

  // Go for the default comparison.
  return !isNaN(value)
}
module.exports.isNumber = isNumber

// isInt checks if a given parameter is an integer. Strings of integers are allowed.
function isInt(value) {
  // Check boundary cases.
  if (Math.abs(value) === Infinity)
    return true

  // Do the general check.
  return isNumber(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) // eslint-disable-line eqeqeq
}
module.exports.isInt = isInt

// ensureNumber ensures that the given value is a number and throws an error otherwise. If it's a string number, like "3.14" then it turns it into a number.
function ensureNumber(x) {
  if (!isNumber(x))
    throw new Error(`Input error: the given value must be a number, but received a parameter of type "${typeof x}" and value "${x}".`)
  return parseFloat(x)
}
module.exports.ensureNumber = ensureNumber

// ensureInt ensures that the given value is an integer and throws an error otherwise. If it's a string number, like "3" then it turns it into an integer.
function ensureInt(x) {
  if (!isInt(x))
    throw new Error(`Input error: the given value must be an integer, but received a parameter of type "${typeof x}" and value "${x}".`)
  return parseInt(x)
}
module.exports.ensureInt = ensureInt

// mod is a modulus function which (unlike its built-in counterpart) is guaranteed to give a number between 0 (inclusive) and n (exclusive).
function mod(a, n) {
  const res = a % n
  return res < 0 ? res + n : res
}
module.exports.mod = mod

// boundTo bounds the given number between the minimum (default 0) and maximum (default 1).
function boundTo(val, min = 0, max = 1) {
  return Math.max(Math.min(val, max), min)
}
module.exports.boundTo = boundTo

// roundTo rounds a number to the given number of digits. So roundTo(12.345, 4) will become 12.35. Similarly, roundTo(123, 2) will be 120. Do note: roundTo(999, 3) will be 999 while roundTo(999, 2) will be 1000.
function roundTo(number, digits) {
  if (!isNumber(number))
    throw new Error(`Invalid input: num has to be a number but "${number}" was given.`)
  if (!isInt(digits) || digits <= 0)
    throw new Error(`Invalid input: digits has to be a positive integer but "${digits}" was given.`)
  const factor = digits - Math.floor(Math.log10(Math.abs(number))) - 1
  return Math.round(number * Math.pow(10, factor)) / Math.pow(10, factor)
}
module.exports.roundTo = roundTo

// getCounterNumber returns a number that increments on every request. This allows us to get unique numbers whenever we request one on a page.
let counter = 0
function getCounterNumber() {
  return counter++
}
module.exports.getCounterNumber = getCounterNumber

// interpolate takes an array of inputValues [x1, x2, ..., xn] (must be sorted ascending) and outputValues [f1, f2, ..., fn] and linearly interpolates to find the function value f(x), where x falls between x1 and xn. If x falls outside of the range [x1, xn], f1 or fn is returned. The parameter x may be an array, and then multiple values will be interpolated. The function values f1, ..., fn may also be arrays (assuming they're the same size) in which case their respective values are interpolated.
function interpolate(inputValues, outputValues, x) {
  // If x is an array, iterate over the values.
  if (Array.isArray(x))
    return x.map(xi => interpolate(inputValues, outputValues, xi))

  // Check input.
  x = ensureNumber(x)
  inputValues = inputValues.map(xi => ensureNumber(xi))
  if (!Array.isArray(inputValues))
    throw new Error(`Input error: inputValues must be an array, but it is of type "${inputValues}".`)
  if (!Array.isArray(outputValues))
    throw new Error(`Input error: outputValues must be an array, but it is of type "${outputValues}".`)
  if (inputValues.some((_, i) => i > 0 && inputValues[i] < inputValues[i - 1]))
    throw new Error(`Interpolation error: inputValues must be in ascending order, but they are not.`)
  if (Array.isArray(outputValues[0]) && outputValues.some(fi => !Array.isArray(fi) || fi.length !== outputValues[0].length))
    throw new Error(`Interpolation error: if outputValues contains arrays, these arrays must all be of the same size. This is not the case.`)

  // Check boundary cases.
  if (x <= inputValues[0])
    return outputValues[0]
  if (x >= lastOf(inputValues))
    return lastOf(outputValues)

  // Find the right index for interpolation.
  const xIndex = inputValues.findIndex((v, i) => i < inputValues.length - 1 && x >= inputValues[i] && x <= inputValues[i+1])
  const part = (x - inputValues[xIndex]) / (inputValues[xIndex + 1] - inputValues[xIndex])
  if (Array.isArray(outputValues[xIndex]))
    return outputValues[xIndex].map((_, i) => (1 - part) * outputValues[xIndex][i] + part * outputValues[xIndex + 1][i])
  return (1 - part) * outputValues[xIndex] + part * outputValues[xIndex + 1]
}
module.exports.interpolate = interpolate
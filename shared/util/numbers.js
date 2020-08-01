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
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
  const res = a%n
  return res < 0 ? res + n : res
}
module.exports.mod = mod

// boundTo bounds the given number between the minimum (default 0) and maximum (default 1).
function boundTo(val, min = 0, max = 1) {
  return Math.max(Math.min(val, max), min)
}
module.exports.boundTo = boundTo
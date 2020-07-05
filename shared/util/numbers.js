// isNumber checks if a given parameter is a number. Strings of numbers are allowed.
function isNumber(value) {
  // Check boundary cases.
  if (typeof value === 'string' && value.trim() === '')
    return false
  
  // Go for the default comparison.
  return !isNaN(value)
}

// isInt checks if a given parameter is an integer. Strings of integers are allowed.
function isInt(value) {
  // Check boundary cases.
  if (Math.abs(value) === Infinity)
    return true
    
  // Do the general check.
  return isNumber(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) // eslint-disable-line eqeqeq
}

// mod is a modulus function which (unlike its built-in counterpart) is guaranteed to give a number between 0 (inclusive) and n (exclusive).
function mod(a, n) {
  const res = a%n
  return res < 0 ? res + n : res
}

module.exports = {
  isNumber,
  isInt,
  mod,
}
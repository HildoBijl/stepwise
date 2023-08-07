const { ensureNumber } = require('./numbers')
const { ensureInt } = require('./integers')

// roundTo rounds a number to the given number of decimals. So roundTo(12.345, 2) will be 12.35, while roundTo(12.345, -1) will be 10.
function roundTo(number, decimals = 0) {
  number = ensureNumber(number)
  decimals = ensureInt(decimals)
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
module.exports.roundTo = roundTo

// roundToDigits rounds a number to the given number of digits. So roundToDigits(12.345, 4) will become 12.35. Similarly, roundToDigits(123, 2) will be 120. Do note: roundToDigits(999, 3) will be 999 while roundToDigits(999, 2) will be 1000.
function roundToDigits(number, digits) {
  number = ensureNumber(number)
  digits = ensureInt(digits, true)

  // Boundary cases.
  if (number === 0)
    return 0
  if (digits === 0)
    return 0
  if (digits === Infinity)
    return number

  // Calculate rounding.
  const decimals = digits - Math.floor(Math.log10(Math.abs(number))) - 1
  return roundTo(number, decimals)
}
module.exports.roundToDigits = roundToDigits

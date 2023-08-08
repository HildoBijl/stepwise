const { ensureInt } = require('../numbers')

const { getPrime, getPrimeFactors } = require('./primes')

// isPower checks if the given number is of the given power. So isPower(81, 4) returns true because 81 = 3^4, but isPower(81, 3) gives false.
function isPower(num, power) {
	num = ensureInt(num)
	power = ensureInt(power, true)

	// Check basic cases.
	if (power === 0)
		return num === 1
	if (power === 1)
		return true
	if (num < 0 && power % 2 === 0)
		return false
	num = Math.abs(num)
	if (num === 0 || num === 1)
		return true

	// Get the prime factors and check if they are all a multiple of the power.
	const primeFactors = getPrimeFactors(num)
	return primeFactors.every(numFactors => numFactors % power === 0)
}
module.exports.isPower = isPower

// isSquare checks if a number is square.
function isSquare(num) {
	return isPower(num, 2)
}
module.exports.isSquare = isSquare

// getLargestPowerFactor takes a number, like 432, and a power, like 3, and then looks for the largest number that, when done to the given power, is still a factor of the number. So with 432 and 3 this will be 6, because 432 = 2^4*3^3, so 6^3 = 216 is still a factor of 432.
function getLargestPowerFactor(num, power) {
	num = ensureInt(num, true, true)
	power = ensureInt(power, true, true)
	const primeFactors = getPrimeFactors(num)
	const filteredPrimeFactors = primeFactors.map(primePower => (primePower - (primePower % power)))
	return filteredPrimeFactors.reduce((num, primePower, index) => num * getPrime(index) ** primePower, 1)
}
module.exports.getLargestPowerFactor = getLargestPowerFactor

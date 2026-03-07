const { ensureInt } = require('../numbers')

const { getPrime, getPrimeFactorization } = require('./primes')

// isPerfectPower checks if the given number is of the given power. So isPerfectPower(81, 4) returns true because 81 = 3^4, but isPerfectPower(81, 3) gives false.
function isPerfectPower(num, power) {
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
	const primeFactors = getPrimeFactorization(num)
	return primeFactors.every(numFactors => numFactors % power === 0)
}
module.exports.isPerfectPower = isPerfectPower

// isSquare checks if a number is square.
function isSquare(num) {
	return isPerfectPower(num, 2)
}
module.exports.isSquare = isSquare

// largestPowerDivisor takes a number, like 432, and a power, like 3, and then looks for the largest number that, when done to the given power, is still a factor of the number. So with 432 and 3 this will be 6, because 432 = 2^4*3^3, so 6^3 = 216 is still a factor of 432.
function largestPowerDivisor(num, power) {
	num = ensureInt(num, true, true)
	power = ensureInt(power, true, true)
	const primeFactors = getPrimeFactorization(num)
	const filteredPrimeFactors = primeFactors.map(primePower => (primePower - (primePower % power)))
	return filteredPrimeFactors.reduce((num, primePower, index) => num * getPrime(index) ** primePower, 1)
}
module.exports.largestPowerDivisor = largestPowerDivisor

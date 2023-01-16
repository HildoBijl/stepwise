const { ensureInt } = require('./numbers')

// gcd returns the greatest common divider of various integer numbers.
function gcd(...params) {
	// Check input.
	params = params.map(number => Math.abs(ensureInt(number)))
	if (params.length === 1)
		return params[0]
	if (params.length > 2)
		return gcd(gcd(params[0], params[1]), ...params.slice(2))

	// Calculate GCD.
	let a = params[0]
	let b = params[1]
	while (b > 0) {
		const c = b
		b = a % b
		a = c
	}
	return a
}
module.exports.gcd = gcd

// gcm returns the smallest common multiple of various integer numbers.
function scm(...params) {
	// Check input.
	params = params.map(number => Math.abs(ensureInt(number)))
	if (params.length === 1)
		return params[0]
	if (params.length > 2)
		return scm(scm(params[0], params[1]), ...params.slice(2))

	// Calculate SCM.
	const a = params[0]
	const b = params[1]
	return a * (b / gcd(a, b))
}
module.exports.scm = scm

// getPrime gives the prime number with the given index. If it doesn't know it yet, it finds it.
const primes = [2, 3, 5, 7, 11]
function getPrime(index) {
	index = ensureInt(index, true)
	while (index >= primes.length) {
		let possibleNextPrime = primes[primes.length - 1] + 2
		while (!isPrime(possibleNextPrime))
			possibleNextPrime += 2
		primes.push(possibleNextPrime)
	}
	return primes[index]
}
module.exports.getPrime = getPrime

// isPrime checks if a number is a prime number.
function isPrime(num) {
	num = ensureInt(num, true, true)
	if (num === 1)
		return false

	// Check all primes until sqrt(num).
	const root = Math.sqrt(num)
	for (let i = 0; true; i++) {
		const prime = getPrime(i)
		if (prime > root)
			return true
		if (num % prime === 0)
			return false
	}
}
module.exports.isPrime = isPrime

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

// getPrimeFactors takes a number, like 140, and returns an array with how often each prime factor occurs in it. So for 140 = 2^2*3^0*5^1*7^1 it returns [2,0,1,1].
function getPrimeFactors(num) {
	num = ensureInt(num, true, true)
	const result = []
	for (let i = 0; num > 1; i++) {
		result[i] = 0
		const prime = getPrime(i)
		while (num % prime === 0) {
			result[i]++
			num /= prime
		}
	}
	return result
}
module.exports.getPrimeFactors = getPrimeFactors

// getLargestPowerFactor takes a number, like 432, and a power, like 3, and then looks for the largest number that, when done to the given power, is still a factor of the number. So with 432 and 3 this will be 6, because 432 = 2^4*3^3, so 6^3 = 216 is still a factor of 432.
function getLargestPowerFactor(num, power) {
	num = ensureInt(num, true, true)
	power = ensureInt(power, true, true)
	const primeFactors = getPrimeFactors(num)
	const filteredPrimeFactors = primeFactors.map(primePower => (primePower - (primePower % power)))
	return filteredPrimeFactors.reduce((num, primePower, index) => num * getPrime(index) ** primePower, 1)
}
module.exports.getLargestPowerFactor = getLargestPowerFactor

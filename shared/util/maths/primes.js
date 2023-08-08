const { ensureInt } = require('../numbers')

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

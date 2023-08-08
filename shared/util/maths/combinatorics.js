const { numberArray } = require('../arrays')
const { ensureInt } = require('../numbers')

// factorial calculates n!. If an extra parameter nEnd is given, it calculates n!/nEnd! = (n * (n-1) * ... * (nEnd + 1)). It memoizes values that have already been calculated.
const factorialMemoization = {}
function factorial(n, nEnd = 0) {
	// Check input.
	n = ensureInt(n, true)
	nEnd = ensureInt(nEnd, true)
	if (n < nEnd)
		throw new Error(`Invalid input: the factorial function requires n >= ${nEnd} but received ${n}.`)

	// If the value has not been memoized, calculate it.
	if (!factorialMemoization[n])
		factorialMemoization[n] = {}
	if (!factorialMemoization[n][nEnd]) {
		if (n === 0 || n === nEnd) {
			factorialMemoization[n][nEnd] = 1
		} else {
			factorialMemoization[n][nEnd] = numberArray(n, nEnd + 1).reduce((f, x) => f * x, 1)
		}
	}

	// Return the requested value.
	return factorialMemoization[n][nEnd]
}
module.exports.factorial = factorial

// binomial calculates (a above b) = a! / (b! * (a-b)!). It memoizes values that have already been calculated.
const binomialMemoization = {}
function binomial(a, b) {
	// Check input.
	a = ensureInt(a, true)
	b = ensureInt(b, true)
	if (a < b)
		throw new Error(`Invalid input: the binomial function requires a >= b but received a=${a} and b=${b}.`)

	// Perform efficiency update.
	if (b > a - b)
		b = a - b

	// If the value has not been memoized, calculate it.
	if (!binomialMemoization[a])
		binomialMemoization[a] = {}
	if (!binomialMemoization[a][b])
		binomialMemoization[a][b] = factorial(a, a - b) / factorial(b) // Calculate it.

	// Return the requested value.
	return binomialMemoization[a][b]
}
module.exports.binomial = binomial

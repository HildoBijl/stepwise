const { numberArray } = require('./arrays')
const { isInt, ensureNumber } = require('./numbers')

// factorial calculates n!. If an extra parameter nEnd is given, it calculates n!/nEnd! = (n * (n-1) * ... * (nEnd + 1)). It memorizes values that have already been calculated.
const factorialMemoization = {}
function factorial(n, nEnd = 0) {
	// Check input.
	if (!isInt(n) || !isInt(nEnd))
		throw new Error(`Invalid input: the factorial function requires integers but was given "${n}" and "${nEnd}".`)
	n = parseInt(n)
	nEnd = parseInt(nEnd)
	if (nEnd < 0)
		throw new Error(`Invalid input: the factorial function requires nEnd >= 0 but received ${nEnd}.`)
	if (n < nEnd)
		throw new Error(`Invalid input: the factorial function requires n >= ${nEnd} but received ${n}.`)

	// Check memoization values. Calculate if necessary.
	if (!factorialMemoization[n])
		factorialMemoization[n] = {}
	if (!factorialMemoization[n][nEnd]) {
		if (n === 0 || n === nEnd) {
			factorialMemoization[n][nEnd] = 1
		} else {
			factorialMemoization[n][nEnd] = numberArray(n, nEnd + 1).reduce((f, x) => f * x, 1)
		}
	}
	return factorialMemoization[n][nEnd]
}
module.exports.factorial = factorial

// binomial calculates (a above b) = a! / (b! * (a-b)!). It memorizes values that have already been calculated.
const binomialMemoization = {}
function binomial(a, b) {
	// Check input.
	if (!isInt(a) || !isInt(b))
		throw new Error(`Invalid input: the binomial function requires integers but was given "${a}" and "${b}".`)
	a = parseInt(a)
	b = parseInt(b)
	if (b < 0)
		throw new Error(`Invalid input: the binomial function requires b > 0 but received ${b}.`)
	if (a < b)
		throw new Error(`Invalid input: the binomial function requires a >= b but received a=${a} and b=${b}.`)

	// Perform efficiency update.
	if (b > a - b)
		b = a - b

	// Check memoization values. Calculate if necessary.
	if (!binomialMemoization[a])
		binomialMemoization[a] = {}
	if (!binomialMemoization[a][b])
		binomialMemoization[a][b] = factorial(a, a - b) / factorial(b) // Calculate it.
	return binomialMemoization[a][b]
}
module.exports.binomial = binomial

// normalPDF calculates the PDF for a Gaussian (normal) distribution.
function normalPDF(x, mu = 0, sigma = 1) {
	// Check input.
	x = ensureNumber(x)
	mu = ensureNumber(mu)
	sigma = ensureNumber(sigma)
	
	// Calculate the PDF.
	return 1/(sigma * Math.sqrt(2*Math.PI)) * Math.exp(-1/2 * ((x - mu)/sigma) ** 2)
}
module.exports.normalPDF = normalPDF
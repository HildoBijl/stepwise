const { factorial, binomial } = require('../util/combinatorics')
const { isObject } = require('../util/objects')
const { ensureInt } = require('../util/numbers')
const { numberArray } = require('../util/arrays')

const { ensureCoef, getOrder, getMoment } = require('./evaluation')
const { normalize, invert } = require('./manipulation')
const { maxSmoothingOrder } = require('./smoothing')
const { ensureDataSet, getCoefFromDataSet } = require('./dataSet')
const { ensureCombiner } = require('./combiners')

// merge takes two sets of coefficients and merges them, coming up with a joint distribution.
function merge(coef1, coef2) {
	// Get orders for easy notation.
	const n1 = getOrder(coef1)
	const n2 = getOrder(coef2)
	const n = n1 + n2

	// Calculate multiplication coefficients.
	const arr1 = coef1.map((c, i) => c * binomial(n1, i))
	const arr2 = coef2.map((c, i) => c * binomial(n2, i))

	// Sum up the corresponding multiplication coefficients.
	let r = new Array(n + 1).fill(0)
	arr1.forEach((v1, i) => {
		arr2.forEach((v2, j) => {
			r[i + j] += v1 * v2
		})
	})

	// Ensure that the coefficients match the desired format.
	r = r.map((v, i) => v / binomial(n, i))
	r = normalize(r)
	return r
}
module.exports.merge = merge

// infer takes a data set (an object with skill IDs as keys and coefficients as values) and a combiner object (for instance { type: 'and', skills: ['A', {type: 'repeat', times: 2, skill: 'B'}, {type: 'repeat', times: 2, skill: { type: 'or', skills: ['C', 'D' ] } } ] } for a skill involving subskill A, subskill B twice and then twice either subskill C or D) and gives the inferred coefficients for the combined skill. Optionally, an order n can be given with which to perform the inference.
// Warning: when n is larger than 30 there may be inaccuracies and when n goes above 50 the results may be bogus.
function infer(dataSet, combiner, n = maxSmoothingOrder / 4) {
	// Check the input.
	dataSet = ensureDataSet(dataSet)
	combiner = ensureCombiner(combiner)

	// Pass on the call internally.
	return inferInternal(dataSet, combiner, n)
}
module.exports.infer = infer

function inferInternal(dataSet, combiner, n) {
	// Handle skill-combiners.
	if (typeof combiner === 'string')
		return getCoefFromDataSet(dataSet, combiner)
	if (combiner.type === 'skill')
		return getCoefFromDataSet(dataSet, combiner.skill)

	// Handle repeat-combiners.
	if (combiner.type === 'repeat') {
		const coef = inferInternal(dataSet, combiner.skill, n)
		return inferAnd([coef], [combiner.times], n)
	}

	// Handle or-combiners.
	if (combiner.type === 'or') {
		// Gather all the coefficients for all the skills.
		const coefs = combiner.skills.map(combiner => inferInternal(dataSet, combiner, n))

		// Invert the coefficients, apply an "and" to them, and invert them back.
		return invert(inferAnd(coefs.map(coef => invert(coef)), coefs.map(_ => 1), n))
	}

	// Handle and-combiners.
	if (combiner.type === 'and') {
		// Prepare data for the inferAnd call.
		const coefs = [], times = []
		combiner.skills.forEach(combiner => {
			if (isObject(combiner) && combiner.type === 'repeat') {
				coefs.push(inferInternal(dataSet, combiner.skill, n)) // Find the coefficients for the subskill.
				times.push(combiner.times)
			} else {
				coefs.push(inferInternal(dataSet, combiner, n))
				times.push(1)
			}
		})
		return inferAnd(coefs, times, n)
	}
}

// inferAnd does an inference on an and-relation. For example, skill a twice and skill b three times. coefs is an array containing coefficient arrays, like [ca, cb]. times is an array containing the number of times they occur, like [2, 3]. It returns the resulting coefficient array.
function inferAnd(coefs, times, n = maxSmoothingOrder / 4) {
	// Check input.
	if (!Array.isArray(coefs) || !Array.isArray(times) || coefs.length !== times.length)
		throw new Error(`Input error: expected coefs and times to be arrays of equal length, but this is not the case.`)
	times = times.map(v => ensureInt(v))

	// Set up moment retrieval, including memoization.
	const momentMemoization = [] // For efficiency, remember moments if we calculate them.
	const getCoefMoment = (index, moment) => {
		if (!momentMemoization[index])
			momentMemoization[index] = []
		if (momentMemoization[index][moment] === undefined)
			momentMemoization[index][moment] = getMoment(coefs[index], moment)
		return momentMemoization[index][moment]
	}

	// Calculate the inference.
	const inference = numberArray(0, n).map(i => {
		return numberArray(0, n - i).reduce((sum, j) => {
			// console.log('j: ' + j)
			const momentMultiplication = times.reduce((product, power, index) => product * getCoefMoment(index, (i + j) * power), 1)
			const divisors = [i, j, n - i - j].sort()
			const factorialMultiplication = factorial(n, divisors[2]) / factorial(divisors[1]) / factorial(divisors[0])
			return sum + (j % 2 === 0 ? 1 : -1) * momentMultiplication * factorialMultiplication
		}, 0)
	})

	// Check if there were problems.
	if (inference.some(x => x < 0))
		throw new Error(`Inference problem: after inference of skills, there were negative coefficients in the coefficient array. This indicates numerical problems and is caused by a too high inference order.`)

	return normalize(inference)
}
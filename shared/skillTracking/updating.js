import { ensureInt } from '../util/numbers'
import { numberArray } from '../util/arrays'
import { ensureBoolean } from '../util/objects'
import { binomial } from '../util/combinatorics'

import { getOrder, ensureCoef } from './evaluation'
import { normalize } from './manipulation'
import { ensureDataSet, getCoefFromDataSet } from './dataSet'
import { ensureCombiner, getCombinerSkills, getRepeat, assume, getCombinerEV } from './combiners'

// processObservation is the main function to update skill coefficients. It is given a data set and a combiner. Additionally, there is a boolean to indicate whether the combine was witnessed as correctly performed or incorrectly performed. The function then checks all skills related to this combiner and updates them accordingly. An adjusted data set with only adjusted skills is returned. Potentially merging this into the main data set is left for the calling function.
export function processObservation(dataSet, combiner, correct) {
	// Check input.
	dataSet = ensureDataSet(dataSet)
	combiner = ensureCombiner(combiner)
	correct = ensureBoolean(correct)

	// Find all skills that we need to update.
	const skills = getCombinerSkills(combiner)
	skills.forEach(skill => {
		if (!dataSet[skill])
			throw new Error(`Unknown skill ID: cannot find the skill "${skill}" in the given data set.`)
	})

	// Walk through the skills and perform the update.
	const adjustedData = {}
	skills.forEach(skill => {
		// Gather basic data.
		const coef = getCoefFromDataSet(dataSet, skill)
		const n = getOrder(coef)
		const repeat = getRepeat(combiner, skill)

		// What is the expected value of the combiner, given various assumptions on the current skill?
		const evTrue = getCombinerEV(dataSet, assume(combiner, skill, true))
		const evFalse = getCombinerEV(dataSet, assume(combiner, skill, false))

		// Walk through the coefficient arrays of all outcomes and, for each situation, determine the likelihood. Use this to add up the coefficient arrays in the right way.
		const coefResultArrays = getCoefArrays(coef, repeat)
		const result = new Array(n + 1 + repeat).fill(0)
		coefResultArrays.forEach((coefResult, i) => {
			const ev = (i === 0 ? evTrue : evFalse)
			const likelihood = (correct ? ev : 1 - ev)
			const factor = likelihood * binomial(repeat, i)
			result.forEach((_, j) => {
				result[j]+= factor * coefResult[j]
			})
		})
		adjustedData[skill] = normalize(result)
	})
	return adjustedData
}

// basicUpdate updates a coefficient array based on whether the skill was correct or incorrect. Coefficients are not normalized yet.
function basicUpdate(coef, correct = false) {
	const n = getOrder(coef)
	if (correct)
		return numberArray(0, n + 1).map(i => (i === 0 ? 0 : coef[i - 1] * i / (n + 2)))
	return numberArray(0, n + 1).map(i => (i === n + 1 ? 0 : coef[i] * (n + 1 - i) / (n + 2)))
}

// getCoefArrays gives an array of coefficient arrays [c with 0 incorrect and n correct, c with 1 incorrect and n-1 correct, ... ]. The number of exercises done is n, meaning the array has length n + 1.
function getCoefArrays(coef, n = 1) {
	// Check input.
	coef = ensureCoef(coef)
	n = ensureInt(n, true)

	// Pass on call to internal functions.
	return getCoefArraysInternal(coef, n)
}

function getCoefArraysInternal(coef, n) {
	// Check boundary case.
	const nOutcomes = n + 1
	if (nOutcomes === 1)
		return [coef]
	if (nOutcomes === 2)
		return [basicUpdate(coef, true), basicUpdate(coef, false)]

	// Let's do this efficiently, with divide and conquer. We split up into halves and merge them together afterwards.
	const nLeft = Math.ceil(nOutcomes / 2) // On the left we want nLeft outcomes.
	const nRight = nOutcomes - nLeft // On the right we want nRight outcomes.
	const coefLeft = numberArray(1, nOutcomes - nLeft).reduce((result) => basicUpdate(result, true), coef) // On the left we should already do (n - nLeft) steps to the left.
	const coefRight = numberArray(1, nOutcomes - nRight).reduce((result) => basicUpdate(result, false), coef) // On the right we should already do (n - nRight) steps to the right.
	return [
		...getCoefArraysInternal(coefLeft, nLeft - 1),
		...getCoefArraysInternal(coefRight, nRight - 1),
	]
}

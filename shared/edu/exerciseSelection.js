const { normalPDF } = require('../util/combinatorics')
const { selectRandomly } = require('../util/random')
const { numberArray } = require('../util/arrays')

// Define general settings for exercise selection.
const mu = 0.5 // Make exercises with success rate 0.5 the most likely.
const sigma = 0.1 // Let the likelihood of selection drop off quite sharply.
const thresholdFactor = 0.3 // Exercises with probability lower than this threshold factor multiplied by the maximum selection rate of all exercises are too unlikely. They will not be selected at all.

// getSelectionRates takes an array of exercise success rates and returns an array of probabilities (likelihoods) with which they should be selected.
function getSelectionRates(successRates) {
	// Use a Gaussian to determine initial rates.
	let selectionRates = successRates.map(rate => normalPDF(rate, mu, sigma))

	// Apply the threshold to make sure very unlikely exercises are not selected at all.
	const threshold = Math.max(...selectionRates) * thresholdFactor
	selectionRates = selectionRates.map(rate => Math.max(rate - threshold, 0))

	// Noramlize probabilities to one.
	const sum = selectionRates.reduce((sum, v) => sum + v, 0)
	selectionRates = selectionRates.map(v => v/sum)
	return selectionRates
}
module.exports.getSelectionRates = getSelectionRates

// selectExercise takes an array of exercise success rates and randomly selects an exercise. It returns the index of the corresponding exercise which should be given.
function selectExercise(successRates) {
	const indices = numberArray(0, successRates.length-1)
	return selectRandomly(indices, getSelectionRates(successRates))
}
module.exports.selectExercise = selectExercise
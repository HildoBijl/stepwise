// Define general settings for exercise selection.
module.exports = {
	mu: 0.4, // Make exercises with this success rate the most likely.
	sigma: 0.15, // Let the likelihood of selection drop off according to this (standard deviation) parameter.
	thresholdFactor: 0.3 // Exercises with probability lower than this threshold-factor multiplied by the maximum selection rate of all exercises are too unlikely. They will not be selected at all.
}

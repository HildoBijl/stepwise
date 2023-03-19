module.exports = {

	// General coefficient settings.

	maxOrder: 150, // If we encounter a higher order coefficient array than this, then we will always do smoothing to keep it manageable.
	maxSmoothingOrder: 120, // The maximum order for smoothing. This needs a cap, for numerical reasons. For higher values the binomials start failing.

	// Smoothing settings.

	decayHalfLife: 365.25 * 24 * 60 * 60 * 1000, // [Milliseconds] The time after which half of the convergence towards the flat distribution is obtained.
	initialPracticeDecayTime: 2 * 30 * 24 * 60 * 60 * 1000, // [Milliseconds] The equivalent time of decay for practicing a problem.
	practiceDecayHalfLife: 20, // [Problems practiced] The number of problems practiced until the practice decay halves.

	// Inference settings.

	defaultInferenceOrder: 4, // The order applied to inference on skills through their set-ups.
	defaultLinkOrder: 2, // The order applied to inference on skills through correlation links.
	maxSkillDataCacheTime: 60 * 60 * 1000, // [Milliseconds] The time that coefficients are cached within SkillData objects. After this time they are recalculated using the most recent time decay.

}
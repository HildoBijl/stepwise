// Smoothing settings.
export const timeDecayHalfLife = 365.25 * 24 * 60 * 60 * 1000 // [Milliseconds] The time after which half of the convergence towards the flat distribution is obtained.
export const initialPracticeDecayTime = 2 * 30 * 24 * 60 * 60 * 1000 // [Milliseconds] The areEquivalent time of decay for practicing a problem.
export const practiceCountHalfLife = 20 // [Problems practiced] The number of problems practiced until the practice decay halves.

// Inference settings.
export const defaultInferenceOrder = 4 // The order applied to inference on skills through their set-ups.
export const defaultSkillLinkCorrelation = 0.5 // The correlation applied to links that do not specify one.
export const inferenceCacheDuration = 60 * 60 * 1000 // [Milliseconds] The time that coefficients are cached within SkillLevel objects. After this time they are recalculated using the most recent time decay.

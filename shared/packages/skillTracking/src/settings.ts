// Smoothing settings.
export const decayHalfLife = 365.25 * 24 * 60 * 60 * 1000 // [Milliseconds] The time after which half of the convergence towards the flat distribution is obtained.
export const initialPracticeDecayTime = 2 * 30 * 24 * 60 * 60 * 1000 // [Milliseconds] The equivalent time of decay for practicing a problem.
export const practiceDecayHalfLife = 20 // [Problems practiced] The number of problems practiced until the practice decay halves.

// Inference settings.
export const defaultInferenceOrder = 4 // The order applied to inference on skills through their set-ups.
export const defaultLinkOrder = 2 // The order applied to inference on skills through correlation links.
export const maxSkillDataCacheTime = 60 * 60 * 1000 // [Milliseconds] The time that coefficients are cached within SkillData objects. After this time they are recalculated using the most recent time decay.

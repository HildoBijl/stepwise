const { isNumber, keysToObject } = require('../../../util')
const { getEV, merge, ensureSetup } = require('../../../skillTracking')

const { exercises } = require('../../skills')

const { getDifficulty } = require('./util')

// getExerciseSuccessRates takes a bunch of exercises and calculates the chance, given access to skill data, that the user will succeed in them. It returns an object { successRates: [...], weights: [...] }.
async function getExerciseSuccessRates(exerciseIds, getSkillDataSet) {
	// Load exercise data and extract weights.
	const exerciseMetaDatas = exerciseIds.map(exerciseId => require(`../../../eduContent/${exercises[exerciseId].path.join('/')}/${exerciseId}`).metaData)
	const weights = exerciseMetaDatas.map(exerciseMetaData => (isNumber(exerciseMetaData.weight) ? Math.abs(exerciseMetaData.weight) : 1))

	// Figure out all the skills that need to be loaded and load them.
	let exerciseSkillIds = new Set()
	exerciseMetaDatas.forEach(exerciseMetaData => {
		['skill', 'setup'].forEach(item => {
			if (!exerciseMetaData[item])
				return
			const setup = ensureSetup(exerciseMetaData[item])
			setup.getSkillList().forEach(skillId => exerciseSkillIds.add(skillId))
		})
	})
	exerciseSkillIds = [...exerciseSkillIds] // Turn set into array.
	const skillDataSet = await getSkillDataSet(exerciseSkillIds) // Load all data for these skills.
	const coefficientSet = keysToObject(exerciseSkillIds, skillId => skillDataSet[skillId].coefficients) // Get the posterior coefficients.

	// Walk through the exercises to calculate success rates (expected values).
	const successRates = exerciseMetaDatas.map((exerciseMetaData) => {
		// If there is only a skill (basic exercise) or only a setup (joint exercise) then use that to estimate the success rate.
		if (!exerciseMetaData.skill || !exerciseMetaData.setup)
			return getDifficulty(exerciseMetaData).getEV(coefficientSet)

		// If there are both a skill and a setup parameter, combine this knowledge.
		const skillCoefficients = coefficientSet[exerciseMetaData.skill]
		const setup = ensureSetup(exerciseMetaData.setup)
		const setupCoefficients = setup.getDistribution(coefficientSet, exerciseMetaData.setupOrder) // The exercise may overwrite the set-up order if desired.
		const mergedCoefficients = merge([skillCoefficients, setupCoefficients])
		return getEV(mergedCoefficients)
	})

	return {
		successRates,
		weights,
	}
}
module.exports.getExerciseSuccessRates = getExerciseSuccessRates

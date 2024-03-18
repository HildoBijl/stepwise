const { keysToObject } = require('../../../util')
const { getEV, merge, ensureSetup } = require('../../../skillTracking')

const { getDifficulty } = require('./util')

// getExerciseSuccessRates takes an object with exercise meta-data { exercise1: metaData1, exercise2: metaData2 } and calculates the chance, given access to skill data, that the user will succeed in them. It returns an object { exercise1: successRate1, exercise2: successRate2 }.
async function getExerciseSuccessRates(exerciseMetaDatas, getSkillDataSet) {
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
	return exerciseMetaDatas.map(exerciseMetaData => {
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
}
module.exports.getExerciseSuccessRates = getExerciseSuccessRates

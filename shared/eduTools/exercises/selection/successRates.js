const { isNumber, keysToObject } = require('../../../util')
const { getEV, merge, ensureSetup } = require('../../../skillTracking')

const { getDifficulty } = require('./util')

// getExerciseSuccessRates takes a bunch of exercises and calculates the chance, given access to skill data, that the user will succeed in them. It returns an object { successRates: [...], weights: [...] }.
async function getExerciseSuccessRates(exerciseIds, getSkillDataSet) {
	// Load exercise data and extract weights.
	const exerciseDatas = exerciseIds.map(exerciseId => require(`../../../eduContent/exercises/${exerciseId}`).data) // ToDo: update links.
	const weights = exerciseDatas.map(exerciseData => (isNumber(exerciseData.weight) ? Math.abs(exerciseData.weight) : 1))

	// Figure out all the skills that need to be loaded and load them.
	let exerciseSkillIds = new Set()
	exerciseDatas.forEach(exerciseData => {
		['skill', 'setup'].forEach(item => {
			if (!exerciseData[item])
				return
			const setup = ensureSetup(exerciseData[item])
			setup.getSkillList().forEach(skillId => exerciseSkillIds.add(skillId))
		})
	})
	exerciseSkillIds = [...exerciseSkillIds] // Turn set into array.
	const skillDataSet = await getSkillDataSet(exerciseSkillIds) // Load all data for these skills.
	const coefficientSet = keysToObject(exerciseSkillIds, skillId => skillDataSet[skillId].coefficients) // Get the posterior coefficients.

	// Walk through the exercises to calculate success rates (expected values).
	const successRates = exerciseDatas.map((exerciseData) => {
		// If there is only a skill (basic exercise) or only a setup (joint exercise) then use that to estimate the success rate.
		if (!exerciseData.skill || !exerciseData.setup)
			return getDifficulty(exerciseData).getEV(coefficientSet)

		// If there are both a skill and a setup parameter, combine this knowledge.
		const skillCoefficients = coefficientSet[exerciseData.skill]
		const setup = ensureSetup(exerciseData.setup)
		const setupCoefficients = setup.getDistribution(coefficientSet, exerciseData.setupOrder) // The exercise may overwrite the set-up order if desired.
		const mergedCoefficients = merge([skillCoefficients, setupCoefficients])
		return getEV(mergedCoefficients)
	})

	return {
		successRates,
		weights,
	}
}
module.exports.getExerciseSuccessRates = getExerciseSuccessRates

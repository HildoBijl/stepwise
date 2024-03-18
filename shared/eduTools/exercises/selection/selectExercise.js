const { isNumber, sum, normalPDF, selectRandomly, keysToObject } = require('../../../util')

const { skillTree, exercises, ensureSkillId } = require('../../skills')

const { mu, sigma, thresholdFactor } = require('./settings')
const { getExerciseSuccessRates } = require('./successRates')

// selectExercise takes a skill ID and randomly picks an exercise from the collection. It does this intelligently based on available skill data. This is obtained through the given (async) function getSkillDataSet. The return value is the exerciseId.
async function selectExercise(skillId, getSkillDataSet, previousExercises = []) {
	// Extract the skill data.
	skillId = ensureSkillId(skillId)
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)

	// Verify that exercises exist and load in their data.
	let exerciseIds = skill.exercises
	if (exerciseIds.length === 0)
		throw new Error(`Invalid request: cannot get an exercise for skill "${skillId}". This skill has no exercises yet.`)
	const exerciseMetaDatas = keysToObject(exerciseIds, exerciseId => require(`../../../eduContent/${exercises[exerciseId].path.join('/')}/${exerciseId}`).metaData)

	// Filter exercises out that have been done recently, but only if this doesn't leave us with no possible exercises.
	previousExercises = previousExercises.sort((a, b) => b.createdAt - a.updatedAt) // Sort descending by date.
	const filteredExerciseIds = exerciseIds.filter(exerciseId => {
		const metaData = exerciseMetaDatas[exerciseId]
		const repeatAfter = isNumber(metaData.repeatAfter) ? metaData.repeatAfter : 1 // Use default value if not given.
		const exercisesSince = previousExercises.findIndex(exercise => exercise.exerciseId === exerciseId)
		return exercisesSince === -1 || exercisesSince >= repeatAfter
	})
	if (filteredExerciseIds.length > 0)
		exerciseIds = filteredExerciseIds

	// For the filtered exercises, calculate success rates and weights, and use these to calculate selection rates.
	const exerciseMetaDatasArray = exerciseIds.map(exerciseId => exerciseMetaDatas[exerciseId])
	const successRates = await getExerciseSuccessRates(exerciseMetaDatasArray, getSkillDataSet)
	const weights = exerciseIds.map(exerciseId => (isNumber(exerciseMetaDatas[exerciseId].weight) ? Math.abs(exercisesMetaDatas[exerciseId].weight) : 1))
	const selectionRates = getSelectionRates(successRates, weights)

	// Select a random exercise, according to the calculated rates, from the list.
	return selectRandomly(exerciseIds, selectionRates)
}
module.exports.selectExercise = selectExercise

// getSelectionRates takes an array of exercise success rates and returns an array of probabilities (likelihoods) with which they should be selected.
function getSelectionRates(successRates, weights) {
	// Check input.
	if (weights === undefined)
		weights = successRates.map(() => 1) // All weights equal.

	// Use a Gaussian to determine initial selection rates.
	let selectionRates = successRates.map(successRate => normalPDF(successRate, mu, sigma))

	// Apply the threshold to make sure very unlikely exercises are not selected at all.
	const threshold = Math.max(...selectionRates) * thresholdFactor
	selectionRates = selectionRates.map(rate => rate < threshold ? 0 : rate)

	// Apply weights. (This is after the threshold, because weights are not related to exercise suitability but exercise variability.)
	selectionRates = selectionRates.map((rate, index) => rate * weights[index])

	// Normalize probabilities to one.
	const selectionRatesSum = sum(selectionRates)
	selectionRates = selectionRates.map(v => v / selectionRatesSum)
	return selectionRates
}
module.exports.getSelectionRates = getSelectionRates

// selectRandomExercise takes a skillId and picks an exercise completely randomly. It does not take into account user skill data. It does take into account exercise weights.
function selectRandomExercise(skillId) {
	// Load the exercises for the given skill.
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)
	const exerciseIds = skill.exercises
	if (exerciseIds.length === 0)
		throw new Error(`Invalid request: cannot get an exercise for skill "${skillId}". This skill has no exercises yet.`)

	// Select an exercise based on the weights.
	const exerciseMetaDatas = exerciseIds.map(exerciseId => require(`../../../eduContent/${exercises[exerciseId].path.join('/')}/${exerciseId}`).metaData)
	const weights = exerciseMetaDatas.map(exerciseMetaData => (isNumber(exerciseMetaData.weight) ? Math.abs(exerciseMetaData.weight) : 1))
	return selectRandomly(exerciseIds, weights)
}
module.exports.selectRandomExercise = selectRandomExercise

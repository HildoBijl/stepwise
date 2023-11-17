const { isNumber, sum, normalPDF, selectRandomly } = require('../../../util')

const { skillTree, ensureSkillId } = require('../../skills')

const { mu, sigma, thresholdFactor } = require('./settings')
const { getExerciseSuccessRates } = require('./successRates')

// selectExercise takes a skill ID and randomly picks an exercise from the collection. It does this intelligently based on available skill data. This is obtained through the given (async) function getSkillDataSet. The return value is the exerciseId.
async function selectExercise(skillId, getSkillDataSet) {
	// Extract the skill data.
	skillId = ensureSkillId(skillId)
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)

	// Get all exercises and intelligently calculate the selection rate.
	const exerciseIds = skill.exercises
	if (exerciseIds.length === 0)
		throw new Error(`Invalid request: cannot get an exercise for skill "${skillId}". This skill has no exercises yet.`)
	const { successRates, weights } = await getExerciseSuccessRates(exerciseIds, getSkillDataSet)
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
	const exerciseDatas = exerciseIds.map(exerciseId => require(`../../../edu/exercises/exercises/${exerciseId}`).data) // ToDo: update links.
	const weights = exerciseDatas.map(exerciseData => (isNumber(exerciseData.weight) ? Math.abs(exerciseData.weight) : 1))
	return selectRandomly(exerciseIds, weights)
}
module.exports.selectRandomExercise = selectRandomExercise

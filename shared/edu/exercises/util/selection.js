const { isNumber } = require('../../../util/numbers')
const { sum } = require('../../../util/arrays')
const { keysToObject } = require('../../../util/objects')
const { normalPDF } = require('../../../util/combinatorics')
const { selectRandomly } = require('../../../util/random')

const { getEV, merge, ensureSetup } = require('../../../skillTracking')

const { skillTree, ensureSkillId, getDifficulty } = require('../../skills')

// Define general settings for exercise selection.
const mu = 0.4 // Make exercises with success rate 0.5 the most likely.
const sigma = 0.15 // Let the likelihood of selection drop off quite sharply.
const thresholdFactor = 0.3 // Exercises with probability lower than this threshold factor multiplied by the maximum selection rate of all exercises are too unlikely. They will not be selected at all.

// getNewExercise takes a skillId and returns a set of exercise data of the form { exerciseId: 'linearEquations', state: { a: 3, b: 12 } }. The state is given in functional format.
async function getNewExercise(skillId, getSkillDataSet) {
	if (!getSkillDataSet || typeof getSkillDataSet !== 'function')
		throw new Error(`Invalid getNewExercise call: no getSkillDataSet function was provided. This function is required to be able to select the appropriate exercise. If a fully random exercise is desired, use the getNewRandomExercise function instead.`)
	const exerciseId = await selectExercise(skillId, getSkillDataSet)
	return getExercise(exerciseId)
}
module.exports.getNewExercise = getNewExercise

// selectExercise takes a skill ID and randomly picks an exercise from the collection. It does this intelligently based on available skill data. This is obtained through the given (async) function getSkillDataSet.
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

// getNewRandomExercise is identical to getNewExercise, but then select the exercise randomly, not taking into account any skill data.
function getNewRandomExercise(skillId) {
	const exerciseId = selectRandomExercise(skillId)
	return getExercise(exerciseId)
}
module.exports.getNewRandomExercise = getNewRandomExercise

// selectRandomExercise takes a skillId and picks an exercise completely randomly. It does not take into account skill data. It does take into account exercise weights.
function selectRandomExercise(skillId) {
	// Load the exercises for the given skill.
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)
	const exerciseIds = skill.exercises
	if (exerciseIds.length === 0)
		throw new Error(`Invalid request: cannot get an exercise for skill "${skillId}". This skill has no exercises yet.`)

	// Select an exercise based on the weights.
	const exerciseDatas = exerciseIds.map(exerciseId => require(`../exercises/${exerciseId}`).data)
	const weights = exerciseDatas.map(exerciseData => (isNumber(exerciseData.weight) ? Math.abs(exerciseData.weight) : 1))
	return selectRandomly(exerciseIds, weights)
}
module.exports.selectRandomExercise = selectRandomExercise

// getExercise takes an exerciseId and sets up an exercise (a state) for that exercise. It returns an object with both the exerciseId and the state.
function getExercise(exerciseId) {
	const { generateState } = require(`../exercises/${exerciseId}`)
	return {
		exerciseId,
		state: generateState(),
	}
}
module.exports.getExercise = getExercise

// getAllExercises walks through all the skills and returns an array (without duplicates) of all the exercise ids. It's useful for testing purposes.
function getAllExercises() {
	const exercises = new Set() // Use a set to remove duplicates.
	Object.values(skillTree).forEach(skill => {
		skill.exercises.forEach(exercise => exercises.add(exercise))
	})
	return [...exercises] // Return as array.
}
module.exports.getAllExercises = getAllExercises

// getExerciseSuccessRates takes a bunch of exercises and calculates the chance, given access to skill data, that the user will succeed in them. It returns an object { successRates: [...], weights: [...] }.
async function getExerciseSuccessRates(exerciseIds, getSkillDataSet) {
	// Load exercise data and extract weights.
	const exerciseDatas = exerciseIds.map(exerciseId => require(`../exercises/${exerciseId}`).data)
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
		const setupCoefficients = exerciseData.setup.getDistribution(coefficientSet, exerciseData.setupOrder) // The exercise may overwrite the set-up order if desired.
		const mergedCoefficients = merge([skillCoefficients, setupCoefficients])
		return getEV(mergedCoefficients)
	})

	return {
		successRates,
		weights,
	}
}

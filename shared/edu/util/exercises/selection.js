const { normalPDF } = require('../../../util/combinatorics')
const { selectRandomly } = require('../../../util/random')
const { isNumber } = require('../../../util/numbers')
const { getCombinerSkills, getCombinerEV } = require('../../../skillTracking')
const { getDifficulty } = require('../skills')
const skills = require('../../skills')

// Define general settings for exercise selection.
const mu = 0.5 // Make exercises with success rate 0.5 the most likely.
const sigma = 0.1 // Let the likelihood of selection drop off quite sharply.
const thresholdFactor = 0.3 // Exercises with probability lower than this threshold factor multiplied by the maximum selection rate of all exercises are too unlikely. They will not be selected at all.

// selectExercise takes a skill ID and randomly picks an exercise from the collection. It does this intelligently based on available skill data. This is obtained through the given (async) function getSkillData.
async function selectExercise(skillId, getSkillsData) {
	// Extract the skill data.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)

	// Get all exercises and intelligently calculate the selection rate.
	const exerciseIds = skill.exercises
	const { successRates, weights } = await getExerciseSuccessRates(exerciseIds, getSkillsData)
	console.log(successRates)
	const selectionRates = getSelectionRates(successRates, weights)
	console.log(selectionRates)

	// Select a random exercise, according to the calculated rates, from the list.
	return selectRandomly(exerciseIds, selectionRates)
}
module.exports.selectExercise = selectExercise

// getSelectionRates takes an array of exercise success rates and returns an array of probabilities (likelihoods) with which they should be selected.
function getSelectionRates(successRates, weights) {
	// Check input.
	if (weights === undefined)
		weights = successRates.map(_ => 1) // All weights equal.

	// Use a Gaussian to determine initial selection rates.
	let selectionRates = successRates.map((rate, index) => normalPDF(rate, mu, sigma))

	// Apply the threshold to make sure very unlikely exercises are not selected at all.
	const threshold = Math.max(...selectionRates) * thresholdFactor
	selectionRates = selectionRates.map(rate => rate < threshold ? 0 : rate)

	// Apply weights. (This is after the threshold, because weights are not related to exercise suitability but exercise variability.)
	selectionRates = selectionRates.map((rate, index) => rate * weights[index])

	// Normalize probabilities to one.
	const sum = selectionRates.reduce((sum, v) => sum + v, 0)
	selectionRates = selectionRates.map(v => v / sum)
	return selectionRates
}
module.exports.getSelectionRates = getSelectionRates

// getNewExercise takes a skillId and returns a set of exercise data of the form { id: 'linearEquations', state: { a: 3, b: 12 } }. The state is given in functional format.
async function getNewExercise(skillId, getSkillData) {
	const exerciseId = await selectExercise(skillId, getSkillData)
	const { generateState } = require(`../../exercises/${exerciseId}`)
	return {
		exerciseId,
		state: generateState(),
	}
}
module.exports.getNewExercise = getNewExercise

// getAllExercises walks through all the skills and returns an array (without duplicates) of all the exercise ids. It's useful for testing purposes.
function getAllExercises() {
	const exercises = new Set() // Use a set to remove duplicates.
	Object.values(skills).forEach(skill => {
		skill.exercises.forEach(exercise => exercises.add(exercise))
	})
	return [...exercises] // Return as array.
}
module.exports.getAllExercises = getAllExercises

// getExerciseSuccessRates takes a bunch of exercises and calculates the chance, given access to skill data, that the user will succeed in them. It returns an object { successRates: [...], weights: [...] }.
async function getExerciseSuccessRates(exerciseIds, getSkillsData) {
	// Load exercise data and extract weights.
	const exerciseDatas = exerciseIds.map(exerciseId => require(`../../exercises/${exerciseId}`).data)
	const weights = exerciseDatas.map(exerciseData => (isNumber(exerciseData.weight) ? Math.abs(exerciseData.weight) : 1))

	// If we cannot get skills data, return a flat success rate.
	if (!getSkillsData)
		return { successRates: exerciseIds.map(_ => 0.5), weights }

	// Figure out all the skills that need to be loaded and load them.
	const skillsToLoad = new Set()
	exerciseDatas.forEach(exerciseData => {
		getCombinerSkills(getDifficulty(exerciseData)).forEach(skillId => skillsToLoad.add(skillId))
	})
	const skills = [...skillsToLoad]
	const skillData = await getSkillsData(skills)

	// Extract coefficients from the skill data.
	const dataSet = {}
	skills.forEach(skillId => {
		dataSet[skillId] = skillData[skillId].coefficients
	})

	// Walk through the exercises to calculate success rates (expected values). Use the set-up when given and otherwise just the skill property.
	const successRates = exerciseDatas.map(exerciseData => getCombinerEV(dataSet, getDifficulty(exerciseData)))
	return {
		successRates,
		weights,
	}
}
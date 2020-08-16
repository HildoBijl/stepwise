const { normalPDF } = require('../../../util/combinatorics')
const { selectRandomly } = require('../../../util/random')
const { numberArray } = require('../../../util/arrays')
const skills = require('../../skills')

// Define general settings for exercise selection.
const mu = 0.5 // Make exercises with success rate 0.5 the most likely.
const sigma = 0.1 // Let the likelihood of selection drop off quite sharply.
const thresholdFactor = 0.3 // Exercises with probability lower than this threshold factor multiplied by the maximum selection rate of all exercises are too unlikely. They will not be selected at all.

// selectExercise takes a skill ID and randomly picks an exercise from the collection. It does this intelligently based on a lot of available data.
function selectExercise(skillId) {
	// Extract the skill data.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)

	// Get all exercises and intelligently calculate the selection rate.
	const exercises = skill.exercises
	const successRates = exercises.map(_ => 0.5) // Temporary. ToDo: implement.
	// ToDo: implement real exercise success rates.
	// ToDo: implement exercise selection weights.
	// ToDo: implement knowledge of prior performed exercises.
	const selectionRates = getSelectionRates(successRates)

	// Select a random exercise, according to the calculated rates, from the list.
	return selectRandomly(exercises, selectionRates)
}
module.exports.selectExercise = selectExercise

// getSelectionRates takes an array of exercise success rates and returns an array of probabilities (likelihoods) with which they should be selected.
function getSelectionRates(successRates) {
	// Use a Gaussian to determine initial rates.
	let selectionRates = successRates.map(rate => normalPDF(rate, mu, sigma))

	// Apply the threshold to make sure very unlikely exercises are not selected at all.
	const threshold = Math.max(...selectionRates) * thresholdFactor
	selectionRates = selectionRates.map(rate => Math.max(rate - threshold, 0))

	// Noramlize probabilities to one.
	const sum = selectionRates.reduce((sum, v) => sum + v, 0)
	selectionRates = selectionRates.map(v => v / sum)
	return selectionRates
}
module.exports.getSelectionRates = getSelectionRates

// getNewExercise takes a skillId and returns a set of exercise data of the form { id: 'linearEquations', state: { a: 3, b: 12 } }. The state is given in functional format.
function getNewExercise(skillId) {
	const exerciseId = selectExercise(skillId)
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
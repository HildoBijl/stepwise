const { selectExercise, selectRandomExercise } = require('./selectExercise')

// getNewExercise takes a skillId and returns exercise data of the form { exerciseId: 'someExercise', state: { a: 3, b: 12 } }. The state is given in FO format.
async function getNewExercise(skillId, getSkillDataSet) {
	if (!getSkillDataSet || typeof getSkillDataSet !== 'function')
		throw new Error(`Invalid getNewExercise call: no getSkillDataSet function was provided. This function is required to be able to select the appropriate exercise. If a fully random exercise is desired, use the getNewRandomExercise function instead.`)
	const exerciseId = await selectExercise(skillId, getSkillDataSet)
	return getExercise(exerciseId)
}
module.exports.getNewExercise = getNewExercise

// getNewRandomExercise is identical to getNewExercise, but then select the exercise randomly, not taking into account any skill data.
function getNewRandomExercise(skillId) {
	const exerciseId = selectRandomExercise(skillId)
	return getExercise(exerciseId)
}
module.exports.getNewRandomExercise = getNewRandomExercise

// getExercise takes an exerciseId and sets up an exercise (a state) for that exercise. It returns an object with both the exerciseId and the state, like { exerciseId: 'someExercise', state: { a: 3, b: 12 } }.
function getExercise(exerciseId) {
	const { generateState } = require(`../../../edu/exercises/exercises/${exerciseId}`) // ToDo: update links.
	return {
		exerciseId,
		state: generateState(),
	}
}
module.exports.getExercise = getExercise

const { exercises } = require('../../skills')

const { selectExercise, selectRandomExercise, selectRandomExample } = require('./selectExercise')

// getNewExercise takes a skillId and returns exercise data of the form { exerciseId: 'someExercise', state: { a: 3, b: 12 } }. The state is given in FO format.
async function getNewExercise(skillId, getSkillDataSet, getSkillExercises) {
	if (!getSkillDataSet || typeof getSkillDataSet !== 'function')
		throw new Error(`Invalid getNewExercise call: no getSkillDataSet function was provided. This function is required to be able to select the appropriate exercise. If a fully random exercise is desired, use the getNewRandomExercise function instead.`)
	const previousExercises = await getSkillExercises(skillId)
	const exerciseId = await selectExercise(skillId, getSkillDataSet, previousExercises)
	return getExercise(exerciseId)
}
module.exports.getNewExercise = getNewExercise

// getNewRandomExercise is identical to getNewExercise, but then select the exercise randomly, not taking into account any skill data.
function getNewRandomExercise(skillId) {
	const exerciseId = selectRandomExercise(skillId)
	return getExercise(exerciseId)
}
module.exports.getNewRandomExercise = getNewRandomExercise

// getNewRandomExample is identical to getNewRandomExercise, but then selects from the examples.
function getNewRandomExample(skillId) {
	const exerciseId = selectRandomExample(skillId)
	return getExercise(exerciseId, true)
}
module.exports.getNewRandomExample = getNewRandomExample

// getExercise takes an exerciseId and sets up an exercise (a state) for that exercise. It returns an object with both the exerciseId and the state, like { exerciseId: 'someExercise', state: { a: 3, b: 12 } }.
function getExercise(exerciseId, example) {
	const { generateState } = require(`../../../eduContent/${exercises[exerciseId].path.join('/')}/${exerciseId}`)
	return {
		exerciseId,
		state: generateState(example),
	}
}
module.exports.getExercise = getExercise

const { last } = require('@step-wise/utils')

function getLastEvent(exercise) {
	const events = (exercise.events || []).filter(event => event.progress !== null) // Filter out the null progress event for group exercises.
	return events.length > 0 ? last(events) : null // Events are already sorted by the database query.
}
module.exports.getLastEvent = getLastEvent

function getExerciseProgress(exercise) {
	const lastEvent = getLastEvent(exercise)
	const defaultInitialProgress = {}
	return lastEvent?.progress ?? defaultInitialProgress
}
module.exports.getExerciseProgress = getExerciseProgress

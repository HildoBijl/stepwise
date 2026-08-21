export function getExerciseOutcome(exercise) {
	if (!exercise.state.done)
		return 'inState'
	if (!exercise.state.solved)
		return 'incorrect'
	if (exercise.history.length > 1)
		return 'partiallyCorrect'
	return 'correct'
}

export function getOutcomeColor(outcome) {
	switch (outcome) {
		case 'correct':
			return 'success'
		case 'partiallyCorrect':
			return 'warning'
		case 'incorrect':
			return 'error'
		case 'inState':
			return 'info'
		default:
			throw new Error(`Invalid exercise outcome: received "${outcome}" but this was not one of the valid options.`)
	}
}

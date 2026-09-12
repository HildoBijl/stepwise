import type { GroupActionUpdateRecord, GroupExerciseRecord } from '../records.ts'

export function mergeGroupActionUpdate(exercise: GroupExerciseRecord | null, update: GroupActionUpdateRecord, refetch: () => Promise<unknown>): GroupExerciseRecord | null {
	if (!exercise || exercise.id !== update.exerciseId) {
		void refetch()
		return exercise
	}
	const event = exercise.history.find(event => event.eventIndex === update.eventIndex)
	if (!event || event.state !== null) {
		void refetch()
		return exercise
	}
	const actions = event.actions.filter(action => action.userId !== update.userId)
	if (update.action) actions.push(update.action)
	return { ...exercise, history: exercise.history.map(currentEvent => currentEvent.eventIndex === update.eventIndex ? { ...currentEvent, actions } : currentEvent) }
}

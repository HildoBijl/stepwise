import type { GroupEventResolutionRecord, GroupExerciseRecord } from '../records.ts'

export function mergeGroupEventResolution(exercise: GroupExerciseRecord | null, resolution: GroupEventResolutionRecord, refetch: () => Promise<unknown>): GroupExerciseRecord | null {
	if (!exercise || exercise.id !== resolution.exerciseId) {
		void refetch()
		return exercise
	}
	const event = exercise.history.find(event => event.eventIndex === resolution.eventIndex)
	if (!event || resolution.nextEvent && resolution.nextEvent.eventIndex !== resolution.eventIndex + 1) {
		void refetch()
		return exercise
	}
	const events = new Map(exercise.history.map(event => [event.eventIndex, event]))
	events.set(resolution.eventIndex, { ...event, state: resolution.state, report: resolution.report })
	if (resolution.nextEvent) events.set(resolution.nextEvent.eventIndex, { ...resolution.nextEvent, actions: [] })
	return {
		...exercise,
		eventIndex: resolution.nextEvent?.eventIndex ?? resolution.eventIndex,
		active: resolution.active,
		state: resolution.state,
		history: [...events.values()].sort((a, b) => a.eventIndex - b.eventIndex),
	}
}

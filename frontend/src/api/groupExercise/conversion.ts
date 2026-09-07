import type { GroupExercise, GroupExerciseAction, GroupExerciseEvent } from './types.ts'
import type { GroupExerciseActionRecord, GroupExerciseEventRecord, GroupExerciseRecord } from './records.ts'

function groupExerciseActionRecordToAction(record: GroupExerciseActionRecord): GroupExerciseAction {
	return { ...record, performedAt: new Date(record.performedAt) }
}

function groupExerciseEventRecordToEvent(record: GroupExerciseEventRecord): GroupExerciseEvent {
	return {
		id: record.id,
		...(record.state === null ? {} : { state: record.state }),
		performedAt: new Date(record.performedAt),
		actions: record.actions.map(groupExerciseActionRecordToAction),
	}
}

export function groupExerciseRecordToExercise(record: GroupExerciseRecord): GroupExercise {
	return {
		id: record.id,
		skillId: record.skillId,
		exerciseId: record.exerciseId,
		mode: record.mode,
		parameters: record.parameters,
		initialState: record.initialState,
		active: record.active,
		startedAt: new Date(record.startedAt),
		...(record.state === null ? {} : { state: record.state }),
		history: record.history.map(groupExerciseEventRecordToEvent),
	}
}
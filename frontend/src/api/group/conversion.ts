import type { Group, GroupExercise, GroupExerciseAction, GroupExerciseEvent, GroupMember } from './types.ts'
import type { GroupExerciseActionRecord, GroupExerciseEventRecord, GroupExerciseRecord, GroupMemberRecord, GroupRecord } from './records.ts'

export function groupMemberRecordToMember(record: GroupMemberRecord): GroupMember {
	return {
		groupId: record.groupId,
		userId: record.userId,
		...(record.name === null ? {} : { name: record.name }),
		...(record.givenName === null ? {} : { givenName: record.givenName }),
		...(record.familyName === null ? {} : { familyName: record.familyName }),
		active: record.active,
		lastActivity: new Date(record.lastActivity),
	}
}

export function groupRecordToGroup(record: GroupRecord): Group {
	return { code: record.code, members: record.members.map(groupMemberRecordToMember) }
}

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

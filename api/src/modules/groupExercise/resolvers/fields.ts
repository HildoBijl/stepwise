import { findOptimum } from '@step-wise/js-utils'

import type { GroupExerciseActionRecord, GroupExerciseEventWithActions, GroupExerciseSampleRecord } from '../models.ts'
import { getCurrentGroupExerciseState, getGroupExerciseEventIndex } from '../service.ts'

export const groupExerciseFieldResolvers = {
	GroupExercise: {
		mode: () => 'group',
		startedAt: (exercise: GroupExerciseSampleRecord) => exercise.createdAt,
		state: (exercise: GroupExerciseSampleRecord) => getCurrentGroupExerciseState(exercise),
		eventIndex: getGroupExerciseEventIndex,
		history: (exercise: GroupExerciseSampleRecord) => exercise.events ?? [],
	}, GroupEvent: {
		performedAt: getGroupEventPerformedAt,
	}, GroupExerciseAction: {
		performedAt: (userAction: GroupExerciseActionRecord) => userAction.updatedAt,
	}
}

function getGroupEventPerformedAt(event: GroupExerciseEventWithActions): Date {
	return findOptimum(event.actions.map(userAction => userAction.updatedAt), (a, b) => a.getTime() > b.getTime()) ?? event.updatedAt
}

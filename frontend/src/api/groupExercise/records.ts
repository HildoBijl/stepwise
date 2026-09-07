import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

export type GroupExerciseActionRecord = {
	id: string
	userId: string
	action: ExerciseAction
	performedAt: string
}

export type GroupExerciseEventRecord = {
	id: string
	state: ExerciseState | null
	performedAt: string
	actions: GroupExerciseActionRecord[]
}

export type GroupExerciseRecord = {
	__typename: 'GroupExercise'
	id: string
	skillId: SkillId
	exerciseId: string
	mode: 'group'
	parameters: ExerciseParameters
	initialState: ExerciseState
	active: boolean
	startedAt: string
	state: ExerciseState | null
	history: GroupExerciseEventRecord[]
}

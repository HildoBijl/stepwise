import type { IncludeOptions } from 'sequelize'

import { last } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import type { ExerciseState } from '@step-wise/exercise-definition'
import { getExercise } from '@step-wise/exercises'

import { UserInputError } from '../../errors.ts'

import type { SkillDatabase, UserSkillRecord } from '../skill/index.ts'

import { type ExerciseEventModel, type ExerciseEventRecord, type ExerciseSampleModel, type ExerciseSampleRecord, type ExerciseSampleWithEvents, hasLoadedExerciseEvents } from './models.ts'

export interface ExerciseDatabase extends SkillDatabase {
	ExerciseEvent: ExerciseEventModel
	ExerciseSample: ExerciseSampleModel
}

export interface GetUserSkillWithExercisesOptions {
	includeActiveExercise?: boolean
	includeExercises?: boolean
	requireActiveExercise?: boolean
	requireNoActiveExercise?: boolean
	createIfNoneExists?: boolean
}

export interface UserSkillWithExercisesResult {
	skill: UserSkillRecord
	exercises: ExerciseSampleWithEvents[]
	activeExercise: ExerciseSampleWithEvents | undefined
}

type UserSkillWithLoadedExercises = UserSkillRecord & { exercises: ExerciseSampleRecord[] }

function hasLoadedExercises(skill: UserSkillRecord): skill is UserSkillWithLoadedExercises {
	return Array.isArray(Reflect.get(skill, 'exercises'))
}

export function getLastEvent(exercise: ExerciseSampleRecord): ExerciseEventRecord | null {
	const events = exercise.events ?? []
	return events.length > 0 ? last(events) : null
}

export function getExerciseState(exercise: ExerciseSampleRecord): ExerciseState {
	return getLastEvent(exercise)?.state ?? exercise.initialState
}

export async function getUserSkillWithExercises(db: ExerciseDatabase, userId: string, skillId: SkillId, options: GetUserSkillWithExercisesOptions = {}): Promise<UserSkillWithExercisesResult | null> {
	const { includeActiveExercise = false, includeExercises = false, requireActiveExercise = false, requireNoActiveExercise = false, createIfNoneExists = false } = options
	const loadExercises = includeActiveExercise || includeExercises || requireActiveExercise || requireNoActiveExercise
	const exerciseInclude: IncludeOptions | undefined = loadExercises ? {
		association: 'exercises', ...(includeExercises ? {} : { where: { active: true } }), required: false,
		order: [['createdAt', 'ASC']], separate: true,
		include: [{ association: 'events', required: false, order: [['createdAt', 'ASC']], separate: true }],
	} : undefined

	// Load in the skill.
	let skill = await db.UserSkill.findOne({
		where: { userId, skillId },
		...(exerciseInclude ? { include: exerciseInclude } : {}),
	})
	let skillWasCreated = false
	if (!skill) {
		if (requireActiveExercise) throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
		if (!createIfNoneExists) return null
		const result = await db.UserSkill.findOrCreate({ where: { userId, skillId }, defaults: { userId, skillId } })
		skill = result[0]
		skillWasCreated = result[1]
	}

	// Extract the active exercise and run a check on it.
	let loadedExercises: ExerciseSampleRecord[] = []
	if (loadExercises && !skillWasCreated) {
		if (!hasLoadedExercises(skill)) throw new Error(`Failed to load exercises for user skill "${skill.id}".`)
		loadedExercises = skill.exercises
	}
	if (!loadedExercises.every(hasLoadedExerciseEvents)) throw new Error(`Failed to load exercise events for user skill "${skill.id}".`)
	const exercises: ExerciseSampleWithEvents[] = loadedExercises
	let activeExercise = exercises.find(exercise => exercise.active)
	if (activeExercise && !getExercise(skillId, activeExercise.exerciseId)) {
		await activeExercise.update({ active: false })
		activeExercise = undefined
	}
	if (requireActiveExercise && !activeExercise) throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
	if (requireNoActiveExercise && activeExercise) throw new UserInputError(`There is still an active exercise for skill "${skillId}".`)
	return { skill, exercises, activeExercise }
}

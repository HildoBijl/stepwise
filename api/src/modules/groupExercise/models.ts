import { type CreationOptional, type HasManyCreateAssociationMixin, type InferAttributes, type InferCreationAttributes, type ModelStatic, type NonAttribute, type Sequelize, DataTypes, Model } from 'sequelize'

import type { SkillId } from '@step-wise/skill-definition'
import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'

import type { GroupWithMembers } from '../group/index.ts'

export class GroupExerciseActionRecord extends Model<InferAttributes<GroupExerciseActionRecord>, InferCreationAttributes<GroupExerciseActionRecord>> {
	declare id: CreationOptional<string>
	declare userId: string
	declare groupExerciseEventId: string
	declare action: ExerciseAction
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export class GroupExerciseEventRecord extends Model<InferAttributes<GroupExerciseEventRecord>, InferCreationAttributes<GroupExerciseEventRecord>> {
	declare id: CreationOptional<string>
	declare groupExerciseSampleId: string
	declare state: ExerciseState | null
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare actions?: NonAttribute<GroupExerciseActionRecord[]>
	declare createAction: NonAttribute<HasManyCreateAssociationMixin<GroupExerciseActionRecord, 'groupExerciseEventId'>>
}

export class GroupExerciseSampleRecord extends Model<InferAttributes<GroupExerciseSampleRecord>, InferCreationAttributes<GroupExerciseSampleRecord>> {
	declare id: CreationOptional<string>
	declare groupId: string
	declare skillId: SkillId
	declare exerciseId: string
	declare parameters: ExerciseParameters
	declare initialState: CreationOptional<ExerciseState>
	declare active: CreationOptional<boolean>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare events?: NonAttribute<GroupExerciseEventRecord[]>
	declare createEvent: NonAttribute<HasManyCreateAssociationMixin<GroupExerciseEventRecord, 'groupExerciseSampleId'>>
}

export type GroupExerciseEventWithActions = Omit<GroupExerciseEventRecord, 'actions'> & { actions: GroupExerciseActionRecord[] }
export type GroupExerciseSampleWithEvents = Omit<GroupExerciseSampleRecord, 'events'> & { events: GroupExerciseEventWithActions[] }
export type GroupWithExercises = GroupWithMembers & { exercises: GroupExerciseSampleWithEvents[] }

export function hasLoadedGroupExerciseActions(event: GroupExerciseEventRecord): event is GroupExerciseEventWithActions {
	return event.actions !== undefined
}

export function hasLoadedGroupExerciseEvents(exercise: GroupExerciseSampleRecord): exercise is GroupExerciseSampleWithEvents {
	return exercise.events !== undefined && exercise.events.every(hasLoadedGroupExerciseActions)
}

export function hasLoadedGroupExercises(group: GroupWithMembers): group is GroupWithExercises {
	const exercises = Reflect.get(group, 'exercises')
	return Array.isArray(exercises) && exercises.every(hasLoadedGroupExerciseEvents)
}

export type GroupExerciseActionModel = ModelStatic<GroupExerciseActionRecord>
export type GroupExerciseEventModel = ModelStatic<GroupExerciseEventRecord>
export type GroupExerciseSampleModel = ModelStatic<GroupExerciseSampleRecord>

export function createGroupExerciseSampleModel(sequelize: Sequelize): GroupExerciseSampleModel {
	class GroupExerciseSample extends GroupExerciseSampleRecord { }
	GroupExerciseSample.init({
		id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		groupId: { type: DataTypes.UUID, allowNull: false },
		skillId: { type: DataTypes.TEXT, allowNull: false },
		exerciseId: { type: DataTypes.TEXT, allowNull: false },
		parameters: { type: DataTypes.JSON, allowNull: false },
		initialState: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
		active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'groupExerciseSample', indexes: [{ fields: ['groupId', 'skillId'], name: 'groupExerciseSamples_groupId_skillId_active_unique', unique: true, where: { active: true } }] })
	return GroupExerciseSample
}

export function createGroupExerciseEventModel(sequelize: Sequelize): GroupExerciseEventModel {
	class GroupExerciseEvent extends GroupExerciseEventRecord { }
	GroupExerciseEvent.init({
		id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		groupExerciseSampleId: { type: DataTypes.UUID, allowNull: false },
		state: { type: DataTypes.JSON, allowNull: true },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'groupExerciseEvent' })
	return GroupExerciseEvent
}

export function createGroupExerciseActionModel(sequelize: Sequelize): GroupExerciseActionModel {
	class GroupExerciseAction extends GroupExerciseActionRecord { }
	GroupExerciseAction.init({
		id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		userId: { type: DataTypes.UUID, allowNull: false },
		groupExerciseEventId: { type: DataTypes.UUID, allowNull: false },
		action: { type: DataTypes.JSON, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'groupExerciseAction', indexes: [{ fields: ['userId', 'groupExerciseEventId'], name: 'group_exercise_actions_user_id_group_exercise_event_id', unique: true }] })
	return GroupExerciseAction
}

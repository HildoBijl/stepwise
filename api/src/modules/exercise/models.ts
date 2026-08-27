import { type CreationOptional, type HasManyCreateAssociationMixin, type InferAttributes, type InferCreationAttributes, type ModelStatic, type NonAttribute, type Sequelize, DataTypes, Model } from 'sequelize'

import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'

export class ExerciseEventRecord extends Model<InferAttributes<ExerciseEventRecord>, InferCreationAttributes<ExerciseEventRecord>> {
	declare id: CreationOptional<string>
	declare exerciseSampleId: string
	declare action: ExerciseAction
	declare state: ExerciseState
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export class ExerciseSampleRecord extends Model<InferAttributes<ExerciseSampleRecord>, InferCreationAttributes<ExerciseSampleRecord>> {
	declare id: CreationOptional<string>
	declare userSkillId: string
	declare exerciseId: string
	declare parameters: ExerciseParameters
	declare initialState: CreationOptional<ExerciseState>
	declare active: CreationOptional<boolean>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare events?: NonAttribute<ExerciseEventRecord[]>
	declare createEvent: NonAttribute<HasManyCreateAssociationMixin<ExerciseEventRecord, 'exerciseSampleId'>>
}

export type ExerciseSampleWithEvents = ExerciseSampleRecord & { events: ExerciseEventRecord[] }

export function hasLoadedExerciseEvents(exercise: ExerciseSampleRecord): exercise is ExerciseSampleWithEvents {
	return exercise.events !== undefined
}

export type ExerciseEventModel = ModelStatic<ExerciseEventRecord>
export type ExerciseSampleModel = ModelStatic<ExerciseSampleRecord>

export function createExerciseSampleModel(sequelize: Sequelize): ExerciseSampleModel {
	class ExerciseSample extends ExerciseSampleRecord { }
	ExerciseSample.init({
		id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		userSkillId: { type: DataTypes.UUID, allowNull: false },
		exerciseId: { type: DataTypes.TEXT, allowNull: false },
		parameters: { type: DataTypes.JSON, allowNull: false },
		initialState: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
		active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'exerciseSample' })
	return ExerciseSample
}

export function createExerciseEventModel(sequelize: Sequelize): ExerciseEventModel {
	class ExerciseEvent extends ExerciseEventRecord { }
	ExerciseEvent.init({
		id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		exerciseSampleId: { type: DataTypes.UUID, allowNull: false },
		action: { type: DataTypes.JSON, allowNull: false },
		state: { type: DataTypes.JSON, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'exerciseEvent' })
	return ExerciseEvent
}

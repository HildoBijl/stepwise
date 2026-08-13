import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'

export class GroupExerciseSubmissionRecord extends Model<InferAttributes<GroupExerciseSubmissionRecord>, InferCreationAttributes<GroupExerciseSubmissionRecord>> {
	declare id: CreationOptional<string>
	declare userId: string
	declare groupExerciseEventId: string
	declare action: unknown
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export class GroupExerciseEventRecord extends Model<InferAttributes<GroupExerciseEventRecord>, InferCreationAttributes<GroupExerciseEventRecord>> {
	declare id: CreationOptional<string>
	declare groupExerciseSampleId: string
	declare progress: unknown | null
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare submissions?: NonAttribute<GroupExerciseSubmissionRecord[]>
	declare createSubmission: NonAttribute<(values: any, options?: any) => Promise<GroupExerciseSubmissionRecord>>
}

export class GroupExerciseSampleRecord extends Model<InferAttributes<GroupExerciseSampleRecord>, InferCreationAttributes<GroupExerciseSampleRecord>> {
	declare id: CreationOptional<string>
	declare groupId: string
	declare skillId: string
	declare exerciseId: string
	declare state: unknown
	declare active: CreationOptional<boolean>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare events?: NonAttribute<GroupExerciseEventRecord[]>
	declare createEvent: NonAttribute<(values: any, options?: any) => Promise<GroupExerciseEventRecord>>
}

export const createGroupExerciseSampleModel = (sequelize: Sequelize) => {
	class GroupExerciseSample extends GroupExerciseSampleRecord {}
	GroupExerciseSample.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true }, groupId: { type: DataTypes.UUID, allowNull: false },
		skillId: { type: DataTypes.TEXT, allowNull: false }, exerciseId: { type: DataTypes.TEXT, allowNull: false },
		state: { type: DataTypes.JSON, allowNull: false }, active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'groupExerciseSample' })
	return GroupExerciseSample
}

export const createGroupExerciseEventModel = (sequelize: Sequelize) => {
	class GroupExerciseEvent extends GroupExerciseEventRecord {}
	GroupExerciseEvent.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true }, groupExerciseSampleId: { type: DataTypes.UUID, allowNull: false },
		progress: { type: DataTypes.JSON, allowNull: true }, createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'groupExerciseEvent' })
	return GroupExerciseEvent
}

export const createGroupExerciseSubmissionModel = (sequelize: Sequelize) => {
	class GroupExerciseSubmission extends GroupExerciseSubmissionRecord {}
	GroupExerciseSubmission.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true }, userId: { type: DataTypes.UUID, allowNull: false },
		groupExerciseEventId: { type: DataTypes.UUID, allowNull: false }, action: { type: DataTypes.JSON, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'groupExerciseSubmission', indexes: [{ fields: ['userId', 'groupExerciseEventId'], unique: true }] })
	return GroupExerciseSubmission
}

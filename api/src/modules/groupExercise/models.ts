import { type CreationOptional, type InferAttributes, type InferCreationAttributes, type ModelStatic, type NonAttribute, type Sequelize, DataTypes, Model } from 'sequelize'

export class GroupExerciseActionRecord extends Model<InferAttributes<GroupExerciseActionRecord>, InferCreationAttributes<GroupExerciseActionRecord>> {
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
	declare state: unknown | null
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare actions?: NonAttribute<GroupExerciseActionRecord[]>
	declare createAction: NonAttribute<(values: any, options?: any) => Promise<GroupExerciseActionRecord>>
}

export class GroupExerciseSampleRecord extends Model<InferAttributes<GroupExerciseSampleRecord>, InferCreationAttributes<GroupExerciseSampleRecord>> {
	declare id: CreationOptional<string>
	declare groupId: string
	declare skillId: string
	declare exerciseId: string
	declare parameters: unknown
	declare initialState: CreationOptional<unknown>
	declare active: CreationOptional<boolean>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare events?: NonAttribute<GroupExerciseEventRecord[]>
	declare createEvent: NonAttribute<(values: any, options?: any) => Promise<GroupExerciseEventRecord>>
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
	}, { sequelize, modelName: 'groupExerciseSample' })
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
	}, { sequelize, modelName: 'groupExerciseAction', indexes: [{ fields: ['userId', 'groupExerciseEventId'], unique: true }] })
	return GroupExerciseAction
}

import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'

export class ExerciseEventRecord extends Model<InferAttributes<ExerciseEventRecord>, InferCreationAttributes<ExerciseEventRecord>> {
	declare id: CreationOptional<string>
	declare exerciseSampleId: string
	declare action: unknown
	declare progress: unknown
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export class ExerciseSampleRecord extends Model<InferAttributes<ExerciseSampleRecord>, InferCreationAttributes<ExerciseSampleRecord>> {
	declare id: CreationOptional<string>
	declare userSkillId: string
	declare exerciseId: string
	declare state: unknown
	declare active: CreationOptional<boolean>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare events?: NonAttribute<ExerciseEventRecord[]>
	declare createEvent: NonAttribute<(values: any, options?: any) => Promise<ExerciseEventRecord>>
}

export function createExerciseSampleModel(sequelize: Sequelize) {
	class ExerciseSample extends ExerciseSampleRecord {}
	ExerciseSample.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		userSkillId: { type: DataTypes.UUID, allowNull: false },
		exerciseId: { type: DataTypes.TEXT, allowNull: false },
		state: { type: DataTypes.JSON, allowNull: false },
		active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'exerciseSample' })
	return ExerciseSample
}

export function createExerciseEventModel(sequelize: Sequelize) {
	class ExerciseEvent extends ExerciseEventRecord {}
	ExerciseEvent.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		exerciseSampleId: { type: DataTypes.UUID, allowNull: false },
		action: { type: DataTypes.JSON, allowNull: false }, progress: { type: DataTypes.JSON, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'exerciseEvent' })
	return ExerciseEvent
}

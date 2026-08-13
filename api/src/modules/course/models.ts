import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ModelStatic, NonAttribute, Sequelize } from 'sequelize'

export type CourseRole = 'student' | 'teacher'

export class CourseRecord extends Model<InferAttributes<CourseRecord>, InferCreationAttributes<CourseRecord>> {
	declare id: CreationOptional<string>
	declare code: string
	declare name: string
	declare description: string | null
	declare goals: string[]
	declare goalWeights: number[] | null
	declare startingPoints: string[]
	declare setup: unknown | null
	declare organization: CreationOptional<string>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare blocks?: NonAttribute<CourseBlockRecord[]>
	declare participants?: NonAttribute<any[]>
	declare students?: NonAttribute<any[]>
	declare courseSubscription?: NonAttribute<CourseSubscriptionRecord>
	declare addParticipant: NonAttribute<(user: any, options?: any) => Promise<any[]>>
	declare removeParticipant: NonAttribute<(user: any, options?: any) => Promise<unknown>>
	declare createBlock: NonAttribute<(values: any, options?: any) => Promise<CourseBlockRecord>>
	declare setBlocks: NonAttribute<(blocks: any[], options?: any) => Promise<unknown>>
}

export class CourseSubscriptionRecord extends Model<InferAttributes<CourseSubscriptionRecord>, InferCreationAttributes<CourseSubscriptionRecord>> {
	declare userId: string
	declare courseId: string
	declare role: CreationOptional<CourseRole>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare user?: NonAttribute<any>
}

export class CourseBlockRecord extends Model<InferAttributes<CourseBlockRecord>, InferCreationAttributes<CourseBlockRecord>> {
	declare id: CreationOptional<string>
	declare courseId: string
	declare index: CreationOptional<number>
	declare name: string
	declare goals: string[]
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export type CourseModel = ModelStatic<CourseRecord>
export type CourseSubscriptionModel = ModelStatic<CourseSubscriptionRecord>
export type CourseBlockModel = ModelStatic<CourseBlockRecord>

export const createCourseModel = (sequelize: Sequelize): CourseModel => {
	class Course extends CourseRecord {}
	Course.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		code: { type: DataTypes.STRING, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: true },
		goals: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
		goalWeights: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
		startingPoints: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
		setup: { type: DataTypes.JSON, allowNull: true },
		organization: { type: DataTypes.STRING, allowNull: false, defaultValue: 'stepwise' },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'course' })
	return Course
}

export const createCourseSubscriptionModel = (sequelize: Sequelize): CourseSubscriptionModel => {
	class CourseSubscription extends CourseSubscriptionRecord {}
	CourseSubscription.init({
		userId: { type: DataTypes.UUID, primaryKey: true },
		courseId: { type: DataTypes.UUID, primaryKey: true },
		role: { type: DataTypes.ENUM('student', 'teacher'), defaultValue: 'student', allowNull: false },
		createdAt: { type: DataTypes.DATE },
		updatedAt: { type: DataTypes.DATE },
	}, { sequelize, modelName: 'courseSubscription' })
	return CourseSubscription
}

export const createCourseBlockModel = (sequelize: Sequelize): CourseBlockModel => {
	class CourseBlock extends CourseBlockRecord {}
	CourseBlock.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		courseId: { type: DataTypes.UUID, allowNull: false },
		index: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		goals: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'courseBlock', defaultScope: { order: [['index', 'ASC']] } })
	return CourseBlock
}

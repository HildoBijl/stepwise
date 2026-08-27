import { type CreationOptional, type HasManyCreateAssociationMixin, type InferAttributes, type InferCreationAttributes, type ModelStatic, type NonAttribute, type Sequelize, DataTypes, Model } from 'sequelize'

import type { SerializedSkillSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'

import type { UserRecord } from '../user/index.ts'

export type CourseRole = 'student' | 'teacher'

export class CourseRecord extends Model<InferAttributes<CourseRecord>, InferCreationAttributes<CourseRecord>> {
	declare id: CreationOptional<string>
	declare code: string
	declare name: string
	declare description: string | null
	declare goals: SkillId[]
	declare goalWeights: number[] | null
	declare startingPoints: SkillId[]
	declare setup: SerializedSkillSetup | null
	declare organization: CreationOptional<string>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare blocks?: NonAttribute<CourseBlockRecord[]>
	declare participants?: NonAttribute<CourseParticipantRecord[]>
	declare students?: NonAttribute<CourseParticipantRecord[]>
	declare courseSubscription?: NonAttribute<CourseSubscriptionRecord>
	declare createBlock: NonAttribute<HasManyCreateAssociationMixin<CourseBlockRecord, 'courseId'>>
}

export class CourseSubscriptionRecord extends Model<InferAttributes<CourseSubscriptionRecord>, InferCreationAttributes<CourseSubscriptionRecord>> {
	declare userId: string
	declare courseId: string
	declare role: CreationOptional<CourseRole>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare user?: NonAttribute<UserRecord>
}

export class CourseBlockRecord extends Model<InferAttributes<CourseBlockRecord>, InferCreationAttributes<CourseBlockRecord>> {
	declare id: CreationOptional<string>
	declare courseId: string
	declare index: CreationOptional<number>
	declare name: string
	declare goals: SkillId[]
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export type CourseParticipantRecord = UserRecord & { courseSubscription: CourseSubscriptionRecord }

export type CourseModel = ModelStatic<CourseRecord>
export type CourseSubscriptionModel = ModelStatic<CourseSubscriptionRecord>
export type CourseBlockModel = ModelStatic<CourseBlockRecord>

export function createCourseModel(sequelize: Sequelize): CourseModel {
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

export function createCourseSubscriptionModel(sequelize: Sequelize): CourseSubscriptionModel {
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

export function createCourseBlockModel(sequelize: Sequelize): CourseBlockModel {
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

import { defineApiModule } from '../types.ts'

import { courseTypeDefs } from './schema.ts'
import { type CourseBlockModel, type CourseModel, type CourseSubscriptionModel, createCourseBlockModel, createCourseModel, createCourseSubscriptionModel } from './models.ts'
import { createCourseLoaders } from './loaders.ts'
import { courseResolvers } from './resolvers.ts'

declare module '../types.ts' {
	interface ApiModels {
		Course: CourseModel
		CourseSubscription: CourseSubscriptionModel
		CourseBlock: CourseBlockModel
	}
}

export const courseModule = defineApiModule({
	models: {
		Course: createCourseModel,
		CourseSubscription: createCourseSubscriptionModel,
		CourseBlock: createCourseBlockModel,
	},
	associate: models => {
		models.Course.belongsToMany(models.User, { as: 'participants', through: models.CourseSubscription, onDelete: 'CASCADE' })
		models.Course.belongsToMany(models.User, { as: 'students', through: { model: models.CourseSubscription, scope: { role: 'student' } }, onDelete: 'CASCADE' })
		models.Course.belongsToMany(models.User, { as: 'teachers', through: { model: models.CourseSubscription, scope: { role: 'teacher' } }, onDelete: 'CASCADE' })
		models.User.belongsToMany(models.Course, { as: 'courses', through: models.CourseSubscription, onDelete: 'CASCADE', hooks: true })
		models.Course.hasMany(models.CourseBlock, { as: 'blocks', onDelete: 'CASCADE' })
		models.CourseBlock.belongsTo(models.Course, { onDelete: 'CASCADE' })
		models.CourseSubscription.belongsTo(models.User, { onDelete: 'CASCADE' })
		models.CourseSubscription.belongsTo(models.Course, { onDelete: 'CASCADE' })
	},
	typeDefs: courseTypeDefs,
	resolvers: courseResolvers,
	createLoaders: createCourseLoaders,
})

export * from './models.ts'
export * from './service.ts'
export * from './userAccess.ts'

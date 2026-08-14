import { defineApiModule } from '../types.js'

import { courseTypeDefs } from './schema.js'
import { createCourseBlockModel, createCourseModel, createCourseSubscriptionModel } from './models.js'
import { createCourseLoaders } from './loaders.js'
import { courseResolvers } from './resolvers.js'

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

export * from './models.js'
export * from './service.js'
export * from './userAccess.js'

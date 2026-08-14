import { defineApiModule } from '../types.js'
import { groupExerciseResolvers } from './resolvers.js'
import { createGroupExerciseEventModel, createGroupExerciseSampleModel, createGroupExerciseSubmissionModel } from './models.js'
import { groupExerciseTypeDefs } from './schema.js'

export const groupExerciseModule = defineApiModule({
	models: {
		GroupExerciseSample: createGroupExerciseSampleModel,
		GroupExerciseEvent: createGroupExerciseEventModel,
		GroupExerciseSubmission: createGroupExerciseSubmissionModel,
	},
	associate: models => {
		models.Group.hasMany(models.GroupExerciseSample, { as: 'exercises', onDelete: 'CASCADE' })
		models.GroupExerciseSample.belongsTo(models.Group, { onDelete: 'CASCADE' })
		models.GroupExerciseSample.hasMany(models.GroupExerciseEvent, { as: 'events', onDelete: 'CASCADE' })
		models.GroupExerciseEvent.belongsTo(models.GroupExerciseSample, { onDelete: 'CASCADE' })
		models.GroupExerciseEvent.hasMany(models.GroupExerciseSubmission, { as: 'submissions', onDelete: 'CASCADE' })
		models.GroupExerciseSubmission.belongsTo(models.GroupExerciseEvent, { onDelete: 'CASCADE' })
		models.GroupExerciseSubmission.belongsTo(models.User, { onDelete: 'CASCADE' })
	},
	typeDefs: groupExerciseTypeDefs, resolvers: groupExerciseResolvers,
})

export * from './models.js'
export * from './service.js'

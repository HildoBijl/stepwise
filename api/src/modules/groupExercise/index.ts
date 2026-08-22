import { defineApiModule } from '../types.ts'
import { groupExerciseResolvers } from './resolvers.ts'
import { createGroupExerciseEventModel, createGroupExerciseSampleModel, createGroupExerciseActionModel } from './models.ts'
import { groupExerciseTypeDefs } from './schema.ts'

export const groupExerciseModule = defineApiModule({
	models: {
		GroupExerciseSample: createGroupExerciseSampleModel,
		GroupExerciseEvent: createGroupExerciseEventModel,
		GroupExerciseAction: createGroupExerciseActionModel,
	},
	associate: models => {
		models.Group.hasMany(models.GroupExerciseSample, { as: 'exercises', onDelete: 'CASCADE' })
		models.GroupExerciseSample.belongsTo(models.Group, { onDelete: 'CASCADE' })
		models.GroupExerciseSample.hasMany(models.GroupExerciseEvent, { as: 'events', onDelete: 'CASCADE' })
		models.GroupExerciseEvent.belongsTo(models.GroupExerciseSample, { onDelete: 'CASCADE' })
		models.GroupExerciseEvent.hasMany(models.GroupExerciseAction, { as: 'actions', onDelete: 'CASCADE' })
		models.GroupExerciseAction.belongsTo(models.GroupExerciseEvent, { onDelete: 'CASCADE' })
		models.GroupExerciseAction.belongsTo(models.User, { onDelete: 'CASCADE' })
	},
	typeDefs: groupExerciseTypeDefs, resolvers: groupExerciseResolvers,
})

export * from './models.ts'
export * from './service.ts'

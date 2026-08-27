import { defineApiModule } from '../types.ts'

import { type GroupExerciseActionModel, type GroupExerciseEventModel, type GroupExerciseSampleModel, createGroupExerciseActionModel, createGroupExerciseEventModel, createGroupExerciseSampleModel } from './models.ts'
import { groupExerciseResolvers } from './resolvers.ts'
import { groupExerciseTypeDefs } from './schema.ts'

declare module '../types.ts' {
	interface ApiModels {
		GroupExerciseSample: GroupExerciseSampleModel
		GroupExerciseEvent: GroupExerciseEventModel
		GroupExerciseAction: GroupExerciseActionModel
	}
}

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

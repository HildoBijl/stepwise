import { defineApiModule } from '../types.js'

import { exerciseTypeDefs } from './schema.js'
import { createExerciseEventModel, createExerciseSampleModel } from './models.js'
import { createExerciseLoaders } from './loaders.js'
import { exerciseResolvers } from './resolvers.js'

export const exerciseModule = defineApiModule({
	models: { ExerciseSample: createExerciseSampleModel, ExerciseEvent: createExerciseEventModel },
	associate: models => {
		models.ExerciseSample.belongsTo(models.UserSkill, { onDelete: 'CASCADE' })
		models.UserSkill.hasMany(models.ExerciseSample, { as: 'exercises', onDelete: 'CASCADE' })
		models.ExerciseSample.hasMany(models.ExerciseEvent, { as: 'events', onDelete: 'CASCADE' })
		models.ExerciseEvent.belongsTo(models.ExerciseSample, { onDelete: 'CASCADE' })
	},
	typeDefs: exerciseTypeDefs,
	resolvers: exerciseResolvers,
	createLoaders: createExerciseLoaders,
})

export * from './models.js'
export * from './service.js'

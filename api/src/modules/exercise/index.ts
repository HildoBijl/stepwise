import { defineApiModule } from '../types.ts'

import { exerciseTypeDefs } from './schema.ts'
import { createExerciseEventModel, createExerciseSampleModel } from './models.ts'
import { createExerciseLoaders } from './loaders.ts'
import { exerciseResolvers } from './resolvers.ts'

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

export * from './models.ts'
export * from './service.ts'

import { defineApiModule } from '../types'
import { createExerciseLoaders } from './loaders'
import { createExerciseEventModel, createExerciseSampleModel } from './models'
import { exerciseResolvers } from './resolvers'
import { exerciseTypeDefs } from './schema'

export const exerciseModule = defineApiModule({
	models: { ExerciseSample: createExerciseSampleModel, ExerciseEvent: createExerciseEventModel },
	associate: models => {
		models.ExerciseSample.belongsTo(models.UserSkill, { onDelete: 'CASCADE' })
		models.UserSkill.hasMany(models.ExerciseSample, { as: 'exercises', onDelete: 'CASCADE' })
		models.ExerciseSample.hasMany(models.ExerciseEvent, { as: 'events', onDelete: 'CASCADE' })
		models.ExerciseEvent.belongsTo(models.ExerciseSample, { onDelete: 'CASCADE' })
	},
	typeDefs: exerciseTypeDefs, resolvers: exerciseResolvers, createLoaders: createExerciseLoaders,
})

export * from './models'
export * from './service'

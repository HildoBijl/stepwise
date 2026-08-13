import { defineApiModule } from '../types'
import { createSkillLoaders } from './loaders'
import { createUserSkillModel } from './model'
import { skillResolvers } from './resolvers'
import { skillTypeDefs } from './schema'

export const skillModule = defineApiModule({
	models: { UserSkill: createUserSkillModel },
	associate: models => {
		models.UserSkill.belongsTo(models.User, { onDelete: 'CASCADE' })
		models.User.hasMany(models.UserSkill, { as: 'skills', onDelete: 'CASCADE' })
	},
	typeDefs: skillTypeDefs,
	resolvers: skillResolvers,
	createLoaders: createSkillLoaders,
})

export * from './coefficients'
export * from './model'
export * from './service'

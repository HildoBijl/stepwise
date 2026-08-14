import { defineApiModule } from '../types'

import { skillTypeDefs } from './schema'
import { createUserSkillModel } from './model'
import { createSkillLoaders } from './loaders'
import { skillResolvers } from './resolvers'

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

export * from './skillLevels'
export * from './model'
export * from './service'
export { skillFields } from './schema'

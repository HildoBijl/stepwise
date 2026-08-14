import { defineApiModule } from '../types.js'

import { skillTypeDefs } from './schema.js'
import { createUserSkillModel } from './model.js'
import { createSkillLoaders } from './loaders.js'
import { skillResolvers } from './resolvers.js'

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

export * from './skillLevels.js'
export * from './model.js'
export * from './service.js'
export { skillFields } from './schema.js'

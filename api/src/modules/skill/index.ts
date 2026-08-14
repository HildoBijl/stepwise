import { defineApiModule } from '../types.ts'

import { skillTypeDefs } from './schema.ts'
import { createUserSkillModel } from './model.ts'
import { createSkillLoaders } from './loaders.ts'
import { skillResolvers } from './resolvers.ts'

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

export * from './skillLevels.ts'
export * from './model.ts'
export * from './service.ts'
export { skillFields } from './schema.ts'

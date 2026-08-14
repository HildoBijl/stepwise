import { defineApiModule } from '../types.js'
import { groupResolvers } from './resolvers.js'
import { createGroupMembershipModel, createGroupModel } from './models.js'
import { groupTypeDefs } from './schema.js'

export const groupModule = defineApiModule({
	models: { Group: createGroupModel, GroupMembership: createGroupMembershipModel },
	associate: models => {
		models.Group.belongsToMany(models.User, { as: 'members', through: models.GroupMembership, onDelete: 'CASCADE' })
		models.User.belongsToMany(models.Group, { as: 'groups', through: models.GroupMembership, onDelete: 'CASCADE', hooks: true })
		models.GroupMembership.belongsTo(models.User, { onDelete: 'CASCADE' })
		models.GroupMembership.belongsTo(models.Group, { onDelete: 'CASCADE' })
	},
	typeDefs: groupTypeDefs, resolvers: groupResolvers,
})

export * from './models.js'
export * from './service.js'

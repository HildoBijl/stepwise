import { defineApiModule } from '../types'
import groupResolvers = require('./resolvers')
import { createGroupMembershipModel, createGroupModel } from './models'
import { groupTypeDefs } from './schema'

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

export * from './models'
export * from './service'

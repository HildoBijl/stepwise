import { defineApiModule } from '../types.ts'

import { type GroupMembershipModel, type GroupModel, createGroupMembershipModel, createGroupModel } from './models.ts'
import { createGroupResolvers } from './resolvers/index.ts'
import type { CleanUpGroupMember } from './resolvers/types.ts'
import { groupTypeDefs } from './schema.ts'

declare module '../types.ts' {
	interface ApiModels {
		Group: GroupModel
		GroupMembership: GroupMembershipModel
	}
}

export function createGroupModule(cleanUpGroupMember: CleanUpGroupMember) {
	return defineApiModule({
		models: { Group: createGroupModel, GroupMembership: createGroupMembershipModel },
		associate: models => {
			models.Group.belongsToMany(models.User, { as: 'members', through: models.GroupMembership, onDelete: 'CASCADE' })
			models.User.belongsToMany(models.Group, { as: 'groups', through: models.GroupMembership, onDelete: 'CASCADE', hooks: true })
			models.GroupMembership.belongsTo(models.User, { onDelete: 'CASCADE' })
			models.GroupMembership.belongsTo(models.Group, { onDelete: 'CASCADE' })
		},
		typeDefs: groupTypeDefs,
		resolvers: createGroupResolvers(cleanUpGroupMember),
	})
}

export * from './models.ts'
export * from './service.ts'

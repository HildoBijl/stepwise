import { type BelongsToManyAddAssociationMixin, type BelongsToManyGetAssociationsMixin, type BelongsToManyRemoveAssociationMixin, type CreationOptional, type InferAttributes, type InferCreationAttributes, type ModelStatic, type NonAttribute, type Sequelize, DataTypes, Model } from 'sequelize'

import type { UserRecord } from '../user/index.ts'

export class GroupMembershipRecord extends Model<InferAttributes<GroupMembershipRecord>, InferCreationAttributes<GroupMembershipRecord>> {
	declare userId: string
	declare groupId: string
	declare active: CreationOptional<boolean>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export class GroupRecord extends Model<InferAttributes<GroupRecord>, InferCreationAttributes<GroupRecord>> {
	declare id: CreationOptional<string>
	declare code: string
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare members?: NonAttribute<GroupMemberRecord[]>
	declare getMembers: NonAttribute<BelongsToManyGetAssociationsMixin<GroupMemberRecord>>
	declare addMember: NonAttribute<BelongsToManyAddAssociationMixin<UserRecord, string>>
	declare removeMember: NonAttribute<BelongsToManyRemoveAssociationMixin<UserRecord, string>>
}

export type GroupMemberRecord = UserRecord & { groupMembership: GroupMembershipRecord }
export type GroupWithMembers = GroupRecord & { members: GroupMemberRecord[] }
export type UserWithGroups = UserRecord & { groups: GroupWithMembers[] }

export function hasLoadedGroupMembers(group: GroupRecord): group is GroupWithMembers {
	return group.members !== undefined
}

export function hasLoadedUserGroups(user: UserRecord): user is UserWithGroups {
	return Array.isArray(Reflect.get(user, 'groups'))
}

export type GroupModel = ModelStatic<GroupRecord>
export type GroupMembershipModel = ModelStatic<GroupMembershipRecord>

export function createGroupModel(sequelize: Sequelize): GroupModel {
	class Group extends GroupRecord {}
	Group.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		code: { type: DataTypes.STRING, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'group', indexes: [{ fields: ['code'], name: 'groups_code', unique: true }] })
	return Group
}

export function createGroupMembershipModel(sequelize: Sequelize): GroupMembershipModel {
	class GroupMembership extends GroupMembershipRecord {}
	GroupMembership.init({
		userId: { type: DataTypes.UUID, primaryKey: true },
		groupId: { type: DataTypes.UUID, primaryKey: true },
		active: { type: DataTypes.BOOLEAN, defaultValue: false },
		createdAt: { type: DataTypes.DATE },
		updatedAt: { type: DataTypes.DATE },
	}, { sequelize, modelName: 'groupMembership' })
	return GroupMembership
}

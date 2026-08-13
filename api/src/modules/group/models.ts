import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'

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
	declare members?: NonAttribute<any[]>
	declare exercises?: NonAttribute<any[]>
	declare getMembers: NonAttribute<() => Promise<any[]>>
	declare addMember: NonAttribute<(user: any, options?: any) => Promise<unknown>>
	declare removeMember: NonAttribute<(user: any, options?: any) => Promise<unknown>>
	declare createExercise: NonAttribute<(values: any, options?: any) => Promise<any>>
}

export const createGroupModel = (sequelize: Sequelize) => {
	class Group extends GroupRecord {}
	Group.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		code: { type: DataTypes.STRING, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'group' })
	return Group
}

export const createGroupMembershipModel = (sequelize: Sequelize) => {
	class GroupMembership extends GroupMembershipRecord {}
	GroupMembership.init({
		userId: { type: DataTypes.UUID, primaryKey: true }, groupId: { type: DataTypes.UUID, primaryKey: true },
		active: { type: DataTypes.BOOLEAN, defaultValue: false },
		createdAt: { type: DataTypes.DATE }, updatedAt: { type: DataTypes.DATE },
	}, { sequelize, modelName: 'groupMembership' })
	return GroupMembership
}

import { type CreationOptional, type InferAttributes, type InferCreationAttributes, type ModelStatic, type Sequelize, DataTypes, Model } from 'sequelize'

export const USER_ROLES = ['student', 'teacher', 'admin'] as const
export type UserRole = typeof USER_ROLES[number]

export class UserRecord extends Model<InferAttributes<UserRecord>, InferCreationAttributes<UserRecord>> {
	declare id: CreationOptional<string>
	declare name: string | null
	declare givenName: string | null
	declare familyName: string | null
	declare email: string
	declare role: CreationOptional<UserRole>
	declare language: string | null
	declare privacyPolicyAcceptedVersion: number | null
	declare privacyPolicyAcceptedAt: Date | null
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
}

export type UserModel = ModelStatic<UserRecord>

export function createUserModel(sequelize: Sequelize): UserModel {
	class User extends UserRecord {}

	User.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		name: { type: DataTypes.TEXT },
		givenName: { type: DataTypes.TEXT },
		familyName: { type: DataTypes.TEXT },
		email: { type: DataTypes.TEXT, unique: 'users_email_key', allowNull: false },
		role: { type: DataTypes.ENUM(...USER_ROLES), defaultValue: 'student', allowNull: false },
		language: { type: DataTypes.STRING(5) },
		privacyPolicyAcceptedVersion: { type: DataTypes.INTEGER, allowNull: true },
		privacyPolicyAcceptedAt: { type: DataTypes.DATE, allowNull: true },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'user' })

	return User
}

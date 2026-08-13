import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { UserRecord } from '../user'

export class SurfConextProfileRecord extends Model<InferAttributes<SurfConextProfileRecord>, InferCreationAttributes<SurfConextProfileRecord>> {
	declare id: string
	declare userId: string
	declare schacHomeOrganization: string | null
	declare schacPersonalUniqueCode: string[] | null
	declare locale: string | null
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare user?: NonAttribute<UserRecord>
}

export const createSurfConextProfileModel = (sequelize: Sequelize) => {
	class SurfConextProfile extends SurfConextProfileRecord {}
	SurfConextProfile.init({
		id: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
		userId: { type: DataTypes.UUID, allowNull: false },
		schacHomeOrganization: { type: DataTypes.TEXT },
		schacPersonalUniqueCode: { type: DataTypes.ARRAY(DataTypes.TEXT) },
		locale: { type: DataTypes.TEXT },
		createdAt: { type: DataTypes.DATE, allowNull: false }, updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'surfConextProfile' })
	return SurfConextProfile
}

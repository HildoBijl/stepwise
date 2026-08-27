import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { SkillId } from '@step-wise/skill-definition'
import { type CreationOptional, type InferAttributes, type InferCreationAttributes, type ModelStatic, type NonAttribute, type Sequelize, DataTypes, Model } from 'sequelize'

export class UserSkillRecord extends Model<InferAttributes<UserSkillRecord>, InferCreationAttributes<UserSkillRecord>> {
	declare id: CreationOptional<string>
	declare userId: string
	declare skillId: SkillId
	declare numPracticed: CreationOptional<number>
	declare coefficients: CreationOptional<BernsteinCoefficients>
	declare coefficientsOn: CreationOptional<Date>
	declare highest: CreationOptional<BernsteinCoefficients>
	declare highestOn: CreationOptional<Date>
	declare createdAt: CreationOptional<Date>
	declare updatedAt: CreationOptional<Date>
	declare mayViewExercises?: NonAttribute<boolean>
}

export type UserSkillModel = ModelStatic<UserSkillRecord>

export function createUserSkillModel(sequelize: Sequelize): UserSkillModel {
	class UserSkill extends UserSkillRecord {}

	UserSkill.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
		userId: { type: DataTypes.UUID, allowNull: false },
		skillId: { type: DataTypes.TEXT, allowNull: false },
		numPracticed: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
		coefficients: { type: DataTypes.ARRAY(DataTypes.DOUBLE), defaultValue: [1], allowNull: false },
		coefficientsOn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
		highest: { type: DataTypes.ARRAY(DataTypes.DOUBLE), defaultValue: [1], allowNull: false },
		highestOn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
		createdAt: { type: DataTypes.DATE, allowNull: false },
		updatedAt: { type: DataTypes.DATE, allowNull: false },
	}, { sequelize, modelName: 'userSkill' })

	return UserSkill
}

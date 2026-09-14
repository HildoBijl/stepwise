import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

const authorConstraint = 'groupExerciseActions_author_check'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addColumn('groupExerciseActions', 'anonymousUserId', { type: DataTypes.UUID, allowNull: true })
	await queryInterface.sequelize.query(`ALTER TABLE "groupExerciseActions" ALTER COLUMN "userId" DROP NOT NULL`)
	await queryInterface.sequelize.query(`ALTER TABLE "groupExerciseActions" ADD CONSTRAINT "${authorConstraint}" CHECK (("userId" IS NULL) <> ("anonymousUserId" IS NULL))`)
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeConstraint('groupExerciseActions', authorConstraint)
	await queryInterface.bulkDelete('groupExerciseActions', { userId: null })
	await queryInterface.sequelize.query(`ALTER TABLE "groupExerciseActions" ALTER COLUMN "userId" SET NOT NULL`)
	await queryInterface.removeColumn('groupExerciseActions', 'anonymousUserId')
}

import type { MigrationParameters } from './types.ts'

const latestExerciseIndex = 'exerciseSamples_userSkillId_createdAt_id'
const userSkillIndex = 'exerciseSamples_userSkillId'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('exerciseSamples', {
		fields: ['userSkillId', { name: 'createdAt', order: 'DESC' }, { name: 'id', order: 'DESC' }],
		name: latestExerciseIndex,
	})
	await queryInterface.removeIndex('exerciseSamples', userSkillIndex)
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('exerciseSamples', {
		fields: ['userSkillId'],
		name: userSkillIndex,
	})
	await queryInterface.removeIndex('exerciseSamples', latestExerciseIndex)
}

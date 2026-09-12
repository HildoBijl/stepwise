import type { MigrationParameters } from './types.ts'

const latestExerciseIndex = 'exerciseSamples_userSkillId_createdAt_id'
const userSkillIndex = 'exerciseSamples_userSkillId'
const latestGroupExerciseIndex = 'groupExerciseSamples_groupId_skillId_createdAt_id'
const groupIndex = 'groupExerciseSamples_groupId'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('exerciseSamples', {
		fields: ['userSkillId', { name: 'createdAt', order: 'DESC' }, { name: 'id', order: 'DESC' }],
		name: latestExerciseIndex,
	})
	await queryInterface.removeIndex('exerciseSamples', userSkillIndex)
	await queryInterface.addIndex('groupExerciseSamples', {
		fields: ['groupId', 'skillId', { name: 'createdAt', order: 'DESC' }, { name: 'id', order: 'DESC' }],
		name: latestGroupExerciseIndex,
	})
	await queryInterface.removeIndex('groupExerciseSamples', groupIndex)
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('groupExerciseSamples', {
		fields: ['groupId'],
		name: groupIndex,
	})
	await queryInterface.removeIndex('groupExerciseSamples', latestGroupExerciseIndex)
	await queryInterface.addIndex('exerciseSamples', {
		fields: ['userSkillId'],
		name: userSkillIndex,
	})
	await queryInterface.removeIndex('exerciseSamples', latestExerciseIndex)
}

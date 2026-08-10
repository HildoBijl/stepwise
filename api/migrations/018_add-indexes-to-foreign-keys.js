module.exports = {
	up: async (queryInterface) => {
		await queryInterface.addIndex('surfConextProfiles', {
			fields: ['userId'],
			name: 'surfConextProfiles_userId',
		})
		await queryInterface.addIndex('exerciseSamples', {
			fields: ['userSkillId'],
			name: 'exerciseSamples_userSkillId',
		})
		await queryInterface.addIndex('exerciseEvents', {
			fields: ['exerciseSampleId'],
			name: 'exerciseEvents_exerciseSampleId',
		})
		await queryInterface.addIndex('groupExerciseSamples', {
			fields: ['groupId'],
			name: 'groupExerciseSamples_groupId',
		})
		await queryInterface.addIndex('groupExerciseEvents', {
			fields: ['groupExerciseSampleId'],
			name: 'groupExerciseEvents_groupExerciseSampleId',
		})
		await queryInterface.addIndex('groupExerciseSubmissions', {
			fields: ['groupExerciseEventId'],
			name: 'groupExerciseSubmissions_groupExerciseEventId',
		})
	},

	down: async (queryInterface) => {
		await queryInterface.removeIndex('groupExerciseSubmissions', 'groupExerciseSubmissions_groupExerciseEventId')
		await queryInterface.removeIndex('groupExerciseEvents', 'groupExerciseEvents_groupExerciseSampleId')
		await queryInterface.removeIndex('groupExerciseSamples', 'groupExerciseSamples_groupId')
		await queryInterface.removeIndex('exerciseEvents', 'exerciseEvents_exerciseSampleId')
		await queryInterface.removeIndex('exerciseSamples', 'exerciseSamples_userSkillId')
		await queryInterface.removeIndex('surfConextProfiles', 'surfConextProfiles_userId')
	},
}

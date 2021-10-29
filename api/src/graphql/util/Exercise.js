const { AuthenticationError, UserInputError  } = require('apollo-server-express')
const { checkSkillIds } = require('./Skill')

;(async () => {
	const {findOptimum} = await import('step-wise/util/arrays.js')

	// getActiveExerciseData takes a userId and a skillId. For this, it returns { user, skill, activeExercise }, where the skill is the UserSkill from the database. If requireExercise is set to true it ensures that there is an active exercise. On false it ensures that there is not. (Otherwise an error is thrown.)
	async function getActiveExerciseData(userId, skillId, db, requireExercise = true) {
		checkSkillIds([skillId])

		// Pull everything from the database.
		const user = userId && await db.User.findByPk(userId, {
			rejectOnEmpty: true,
			include: {
				association: 'skills',
				where: {skillId},
				required: false,
				include: {
					association: 'exercises',
					where: {active: true},
					required: false,
					include: {
						association: 'events',
						required: false,
					},
				},
			},
		})
		if (!user)
			throw new AuthenticationError('No user is logged in.')

		// Obtain or create the skill.
		let skill = user.skills && user.skills[0]
		if (!skill) {
			if (requireExercise) {
				throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
			} else {
				skill = await user.createSkill({skillId})
			}
		}

		// Obtain the exercise and check if it matches expectations.
		const exercise = skill.exercises && skill.exercises[0]
		if (requireExercise) {
			if (!exercise)
				throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
		} else {
			if (exercise)
				throw new UserInputError(`There is still an active exercise for skill "${skillId}".`)
		}

		return {user, skill, exercise}
	}

	module.exports.getActiveExerciseData = getActiveExerciseData

	function getLastEvent(exercise) {
		if (!exercise.events || exercise.events.length === 0)
			return null
		return findOptimum(exercise.events, (a, b) => a.createdAt > b.createdAt)
	}

	module.exports.getLastEvent = getLastEvent

	function getExerciseProgress(exercise) {
		const lastEvent = getLastEvent(exercise)
		return (lastEvent === null ? {} : lastEvent.progress) // Note that {} is the default initial progress.
	}

	module.exports.getExerciseProgress = getExerciseProgress
})()

const { AuthenticationError, UserInputError } = require('apollo-server-express')

const { findOptimum } = require('step-wise/util/arrays')
const { arraysToObject } = require('step-wise/util/objects')

const { getCombinerSkills, getSmoothingFactor, smoothen, processObservation, getEV } = require('step-wise/skillTracking')

const { checkSkillIds } = require('./Skill')

// getActiveExerciseData takes a userId and a skillId. For this, it returns { user, skill, activeExercise }, where the skill is the UserSkill from the database. If requireExercise is set to true it ensures that there is an active exercise. On false it ensures that there is not. (Otherwise an error is thrown.)
async function getActiveExerciseData(userId, skillId, db, requireExercise = true) {
	checkSkillIds([skillId])

	// Pull everything from the database.
	const user = userId && await db.User.findByPk(userId, {
		rejectOnEmpty: true,
		include: {
			association: 'skills',
			where: { skillId },
			required: false,
			include: {
				association: 'exercises',
				where: { active: true },
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
			skill = await user.createSkill({ skillId })
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

	return { user, skill, exercise }
}
module.exports.getActiveExerciseData = getActiveExerciseData

function getLastEvent(exercise) {
	const events = exercise.events && exercise.events.filter(event => event.progress !== null) // Filter out the null progress event for group exercises.
	if (!events || events.length === 0)
		return null
	return findOptimum(events, (a, b) => a.createdAt > b.createdAt)
}
module.exports.getLastEvent = getLastEvent

function getExerciseProgress(exercise) {
	const lastEvent = getLastEvent(exercise)
	return (lastEvent === null ? {} : lastEvent.progress) // Note that {} is the default initial progress.
}
module.exports.getExerciseProgress = getExerciseProgress

// applySkillUpdates takes an array [{ skill: {...}, correct: true/false, userId: 'someId' }, ...] and applies all the skill updates into the database. It return 
async function applySkillUpdates(skillUpdates, db, transaction) {
	// Group the skill updates per user.
	const skillUpdatesPerUser = {}
	skillUpdates.forEach(skillUpdate => {
		const { userId } = skillUpdate
		if (skillUpdatesPerUser[userId] === undefined)
			skillUpdatesPerUser[userId] = [skillUpdate]
		else
			skillUpdatesPerUser[userId].push(skillUpdate)
	})

	// Process the skill updates for each user separately.
	const userIds = Object.keys(skillUpdatesPerUser)
	const result = await Promise.all(userIds.map(async userId => await applySkillUpdatesForUser(skillUpdatesPerUser[userId], userId, db, transaction)))
	return arraysToObject(userIds, result)
}
module.exports.applySkillUpdates = applySkillUpdates

// applySkillUpdatesForUser takes an array [{ skill: {...}, correct: true/false }, ...] and applies all these skill updates for the given userId.
async function applySkillUpdatesForUser(skillUpdates, userId, db, transaction) {
	// Extract all skillIds in the updates.
	let skillIds = skillUpdates.map(({ skill }) => getCombinerSkills(skill)).flat() // Get all IDs.
	skillIds = [...new Set(skillIds)] // Filter duplicates.
	checkSkillIds(skillIds) // Make sure they exist.

	// If there are no skills, don't do anything. Return an empty array to show no skills were adjusted.
	if (skillIds.length === 0)
		return []

	// Pull everything from the database.
	const skills = await db.UserSkill.findAll({
		where: {
			userId,
			skillId: skillIds,
		},
	})

	// Smoothen all coefficients to the current data and plug them into a data set. (A data set is just an object with skillIds as indices and raw coefficient arrays as values.)
	let dataSet = {}
	const exists = {}
	const now = new Date()
	skills.forEach(skill => {
		exists[skill.skillId] = true // Mark that this skill exists.
		const factor = getSmoothingFactor({
			time: now - skill.coefficientsOn,
			applyPracticeDecay: true,
			numProblemsPracticed: skill.numPracticed,
		})
		dataSet[skill.skillId] = smoothen(skill.coefficients, factor)
	})

	// Walk through all skillIds and check if they're in the data set. Any missing ones simply aren't in the database yet.
	skillIds.forEach(skillId => {
		if (!exists[skillId])
			dataSet[skillId] = [1]
	})

	// Walk through the skill updates and apply them one by one, adjusting the data set.
	skillUpdates.forEach(({ skill, correct }) => {
		dataSet = {
			...dataSet, // Possibly non-adjusted data.
			...processObservation(dataSet, skill, correct), // Adjusted data.
		}
	})

	// Walk through the sequelize-skills to apply the updates done in the data set. When doing so, also check the highest value.
	const skillUpdatePromises = skills.map(skill => {
		// Set up the initial update.
		const update = {
			numPracticed: skill.numPracticed + 1,
			coefficients: dataSet[skill.skillId],
			coefficientsOn: now,
		}

		// Check for the highest value. For this, first check the current EV and then check again after smoothing.
		const newHighest = getHighest(skill.coefficients, skill.highest, skill.numPracticed)
		if (skill.highest !== newHighest) {
			update.highest = newHighest
			update.highestOn = now
		}

		// Apply the update. Return the resulting promise.
		return skill.update(update, { transaction })
	})

	// Create new skills for the ones previously missing, and add their promises to the promise array.
	skillIds.forEach(skillId => {
		// Check if we don't already have this one.
		if (exists[skillId])
			return

		// Add a new UserSkill to the database.
		const skillPromise = db.UserSkill.create({
			userId,
			skillId,
			numPracticed: 1,
			coefficients: dataSet[skillId],
			coefficientsOn: now,
			highest: getHighest(dataSet[skillId], [1], 1),
			highestOn: now,
		}, { transaction })
		skillUpdatePromises.push(skillPromise)
	})

	// Wait until all promises are resolved and return the adjusted skills in an array.=
	return await Promise.all(skillUpdatePromises)
}
module.exports.applySkillUpdatesForUser = applySkillUpdatesForUser

// getHighest takes a set of (new) coefficients, the currently highest coefficients from the past, and numPracticed. It then compares them to see what the highest coefficients should be.
function getHighest(coefficients, highest, numPracticed) {
	// If the coefficients aren't higher than the highest, nothing is going on.
	const highestEV = getEV(highest)
	if (getEV(coefficients) < highestEV)
		return highest

	// The coefficients are higher now. But are they still higher after smoothing?
	const factor = getSmoothingFactor({
		applyPracticeDecay: true,
		numProblemsPracticed: numPracticed,
	})
	const smoothenedCoefficients = smoothen(coefficients, factor)
	if (getEV(smoothenedCoefficients) <= highestEV)
		return highest
	return smoothenedCoefficients
}
module.exports.getHighest = getHighest

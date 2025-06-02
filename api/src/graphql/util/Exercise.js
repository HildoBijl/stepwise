const { AuthenticationError, UserInputError } = require('apollo-server-express')

const { findOptimum, ensureBoolean, arraysToObject, keysToObject, union } = require('step-wise/util')
const { smoothen, getEV, ensureSetup } = require('step-wise/skillTracking')
const { ensureSkillId, ensureSkillIds } = require('step-wise/eduTools')

// getActiveExerciseData takes a userId and a skillId. For this, it returns { user, skill, activeExercise }, where the skill is the UserSkill from the database. If requireExercise is set to true it ensures that there is an active exercise. On false it ensures that there is not. (Otherwise an error is thrown.)
async function getActiveExerciseData(userId, skillId, db, requireExercise = true) {
	skillId = ensureSkillId(skillId)

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

// applySkillUpdates takes an array [{ setup: {...}, correct: true/false, userId: 'someId' }, ...] and applies all the skill updates into the database. It return 
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

// applySkillUpdatesForUser takes an array [{ setup: {...}, correct: true/false }, ...] and applies all these skill updates for the given userId.
async function applySkillUpdatesForUser(skillUpdates, userId, db, transaction) {
	// Ensure valid skill updates.
	skillUpdates = skillUpdates.map(({ setup, correct }) => ({
		setup: ensureSetup(setup),
		correct: ensureBoolean(correct),
	}))

	// Extract all skillIds in the updates, ensuring there are no duplicates and making sure they all exist.
	const skillSets = skillUpdates.map(({ setup }) => setup.getSkillSet())
	const skillSetsMerged = union(...skillSets)
	const skillIds = ensureSkillIds([...skillSetsMerged])

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
	const skillsAsObject = arraysToObject(skills.map(skill => skill.skillId), skills)

	// Set up a coefficient set. Put in all loaded skills, smoothened to the current time, and use fillers for all other skills.
	const now = new Date()
	let coefficientSet = keysToObject(skillIds, skillId => {
		const skill = skillsAsObject[skillId]
		if (!skill)
			return [1]
		const options = {
			time: now - skill.coefficientsOn,
			applyPracticeDecay: true,
			numProblemsPracticed: skill.numPracticed,
			// ToDo later: implement option for different properties for each skill.
		}
		return smoothen(skill.coefficients, options)
	})

	// Walk through the skill updates and apply them one by one, adjusting the data set.
	skillUpdates.forEach(({ setup, correct }) => {
		coefficientSet = {
			...coefficientSet, // Possibly non-adjusted data.
			...setup.processObservation(coefficientSet, correct), // Adjusted data.
		}
	})

	// Walk through the sequelize-skills to apply the updates done in the data set. When doing so, also check the highest value.
	const skillUpdatePromises = skills.map(skill => {
		// Set up the initial update.
		const update = {
			numPracticed: skill.numPracticed + 1,
			coefficients: coefficientSet[skill.skillId],
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
		if (skillsAsObject[skillId])
			return

		// Add a new UserSkill to the database.
		const skillPromise = db.UserSkill.create({
			userId,
			skillId,
			numPracticed: 1,
			coefficients: coefficientSet[skillId],
			coefficientsOn: now,
			highest: getHighest(coefficientSet[skillId], [1], 1),
			highestOn: now,
		}, { transaction })
		skillUpdatePromises.push(skillPromise)
	})

	// Wait until all promises are resolved and return the adjusted skills in an array.
	return await Promise.all(skillUpdatePromises)
}
module.exports.applySkillUpdatesForUser = applySkillUpdatesForUser

// getHighest takes a set of (new) coefficients, the currently highest coefficients from the past, and numPracticed. It then compares them to see what the highest coefficients should be.
function getHighest(coefficients, highest, numPracticed) {
	// If the coefficients aren't higher than the highest, nothing is going on.
	const highestEV = getEV(highest)
	if (getEV(coefficients) <= highestEV)
		return highest

	// The coefficients are higher now. But are they still higher after smoothing?
	const options = {
		applyPracticeDecay: true,
		numProblemsPracticed: numPracticed,
		// ToDo later: implement option for different properties for each skill.
	}
	const smoothenedCoefficients = smoothen(coefficients, options)
	if (getEV(smoothenedCoefficients) <= highestEV)
		return highest
	return smoothenedCoefficients
}
module.exports.getHighest = getHighest

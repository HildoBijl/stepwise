const { ensureBoolean, arraysToObject, keysToObject, union } = require('step-wise/util')
const { ensureSetup, processSkillDataSet, smoothen, getEV } = require('step-wise/skillTracking')
const { skillTree, ensureSkillIds, includePrerequisitesAndLinks, processSkill, getDefaultSkillData } = require('step-wise/eduTools')

const { getUserSkills } = require('./Skill')

// getUserSkillDataSet takes a userId and skillIds and returns a skill data set object with SkillData parameters in it (so very processed objects) for the given user. To do so, it pulls the respective skills and their prerequisites from the database and processes the results. No caching is done.
async function getUserSkillDataSet(db, userId, skillIds) {
	// Load all required skills from the database. Process them into something functional.
	const allSkillIds = includePrerequisitesAndLinks(skillIds) // Add links.
	const rawSkills = await getUserSkills(db, userId, allSkillIds) // Pull all data from the database.
	const processedSkills = rawSkills.map(skill => processSkill(skill)) // Apply basic processing.
	const skillsAsObject = arraysToObject(processedSkills.map(skill => skill.skillId), processedSkills) // Turn the array into an object.
	const skills = keysToObject(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId)) // Add in missing skills that are not in the database yet.
	const skillDataSet = processSkillDataSet(skills, skillTree) // Turn the raw data into SkillData objects.
	return skillDataSet
}
module.exports.getUserSkillDataSet = getUserSkillDataSet

// ToDo: check out the functions below.

// applySkillUpdates takes an array [{ setup: {...}, correct: true/false, userId: 'someId' }, ...] and applies all the skill updates into the database. It return 
async function applySkillUpdates(db, skillUpdates, transaction) {
	// Group the skill updates per user.
	const skillUpdatesPerUser = {}
	skillUpdates.forEach(skillUpdate => {
		const { userId } = skillUpdate
		if (!skillUpdatesPerUser[userId])
			skillUpdatesPerUser[userId] = []
		skillUpdatesPerUser[userId].push(skillUpdate)
	})

	// Process the skill updates for each user separately.
	const userIds = Object.keys(skillUpdatesPerUser)
	const result = await Promise.all(userIds.map(userId => applySkillUpdatesForUser(db, userId, skillUpdatesPerUser[userId], transaction)))
	return arraysToObject(userIds, result)
}
module.exports.applySkillUpdates = applySkillUpdates

// applySkillUpdatesForUser takes an array [{ setup: {...}, correct: true/false }, ...] and applies all these skill updates for the given userId.
async function applySkillUpdatesForUser(db, userId, skillUpdates, transaction) {
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
	const skills = await getUserSkills(db, userId, skillIds)
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

		// If the new value is higher than the highest value, update the highest value too.
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

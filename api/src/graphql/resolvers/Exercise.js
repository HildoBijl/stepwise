const { getNewExercise } = require('step-wise/edu/util/exercises/selection')
const { FOtoIO, IOtoFO } = require('step-wise/edu/util/inputTypes')
const { getCombinerSkills, getSmoothingFactor, smoothen, processObservation, getEV } = require('step-wise/skillTracking')

const { getLastEvent, getExerciseProgress, getActiveExerciseData } = require('../util/Exercise')
const { checkSkillIds } = require('../util/Skill')

const resolvers = {
	Exercise: {
		startedOn: exercise => exercise.createdAt,
		progress: exercise => getExerciseProgress(exercise),
		lastAction: exercise => {
			const lastEvent = getLastEvent(exercise)
			return (lastEvent && lastEvent.action) || null
		},
		lastActionAt: exercise => {
			const lastEvent = getLastEvent(exercise)
			return (lastEvent && lastEvent.createdAt) || null
		},
		history: exercise => exercise.events || [],
	},

	Mutation: {
		startExercise: async (_source, { skillId }, { db, getUserId }) => {
			const { skill } = await getActiveExerciseData(getUserId(), skillId, db, false)

			// Select a new exercise, store it and return the result.
			const newExercise = getNewExercise(skillId) // ToDo: add skill data to make a more informed decision.
			return await skill.createExercise({ exerciseId: newExercise.exerciseId, state: FOtoIO(newExercise.state), active: true })
		},

		submitExerciseAction: async (_source, { skillId, action }, { db, getUserId }) => {
			const userId = getUserId()
			const { exercise } = await getActiveExerciseData(userId, skillId, db, true)

			// Set up an updateSkills handler that only collects calls.
			const skillUpdates = []
			const updateSkills = (skill, correct) => skillUpdates.push({ skill, correct })

			// Update the progress parameter.
			const prevProgress = getExerciseProgress(exercise)
			const { processAction } = require(`step-wise/edu/exercises/${exercise.exerciseId}`)
			const progress = processAction({ action, state: IOtoFO(exercise.state), progress: prevProgress, history: exercise.events, updateSkills })
			if (!progress)
				throw new Error(`Invalid progress object: could not process action due to an error in updating the exercise progress.`)

			// Time to store things in the database.
			let adjustedSkills
			await db._sequelize.transaction(async (transaction) => { // ToDo: check if this is the best way of accessing sequelize to set up a transaction.
				// Apply all the skill updates that were collected so far.
				adjustedSkills = await applySkillUpdates(skillUpdates, userId, db, transaction)

				// Store the submission and on a correct one update the active field of the exercise to solved.
				const newEvent = await exercise.createEvent({ action, progress }, { transaction })
				exercise.events.push(newEvent) // In Sequelize we have to manually add the new action to the current object. 
				if (progress.done)
					await exercise.update({ active: false }, { transaction })
			})

			// Return all required data.
			return {
				updatedExercise: exercise,
				adjustedSkills,
			}
		},
	},
}
module.exports = resolvers

async function applySkillUpdates(skillUpdates, userId, db, transaction) {
	// Extract all skillIds in the updates.
	let skillIds = skillUpdates.map(({ skill }) => getCombinerSkills(skill)).flat() // Get all IDs.
	skillIds = [...new Set(skillIds)] // Filter duplicates.
	checkSkillIds(skillIds) // Make sure they exist.

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

	// Walk through the skill updates and apply them one by one.
	skillUpdates.forEach(({ skill, correct }) => {
		dataSet = {
			...dataSet, // Possibly non-adjusted data.
			...processObservation(dataSet, skill, correct), // Adjusted data.
		}
	})

	// Walk through the skills to apply the updates. When doing so, also check the highest value.
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
		})
		skillUpdatePromises.push(skillPromise)
	})

	// Wait until all promises are resolved and return the adjusted skills in an array.
	return await Promise.all(skillUpdatePromises)
}

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
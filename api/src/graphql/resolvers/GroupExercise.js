const { UserInputError } = require('apollo-server-express')

const { findOptimum } = require('step-wise/util')
const { toFO, toSO } = require('step-wise/inputTypes')
const { exercises, getNewRandomExercise, fixExerciseId, getExerciseName } = require('step-wise/eduTools')

const { getSubscription } = require('../util/subscriptions')
const { events: skillEvents } = require('../util/Skill')
const { applySkillUpdates } = require('../util/Exercise')
const { events: groupExerciseEvents, verifyGroupAccess, getGroupExerciseProgress, getGroupWithActiveExercises, getGroupWithActiveSkillExercise, processGroupExercises } = require('../util/GroupExercise')

const resolvers = {
	GroupExercise: {
		startedOn: exercise => exercise.createdAt,
		progress: exercise => getGroupExerciseProgress(exercise),
		history: exercise => exercise.events.sort((a, b) => a.createdAt - b.createdAt) || [], // Sort the history ascending by date.
	},

	GroupEvent: {
		performedAt: event => findOptimum(event.submissions.map(submission => submission.updatedAt), (a, b) => a > b) || event.updatedAt, // Get the time of the last submission.
	},

	GroupSubmission: {
		performedAt: submission => submission.updatedAt,
	},

	Query: {
		activeGroupExercises: async (_source, { code }, { db, getCurrentUserId }) => {
			const group = await getGroupWithActiveExercises(code, db)
			verifyGroupAccess(group, getCurrentUserId())
			return group.exercises
		},
	},

	Mutation: {
		startGroupExercise: async (_source, { code, skillId }, { db, pubsub, getCurrentUserId }) => {
			// Verify that the user is a member of the given group.
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, getCurrentUserId())

			// If an active group exercise already exists, return this. (If two users start one at the same time, then at least no error is thrown.)
			if (group.exercises.length > 0)
				return processGroupExercises(group).exercises[0]

			// Select a new exercise, store it, and right away add an empty event to couple submissions to.
			const newExercise = await getNewRandomExercise(skillId)
			const exercise = await group.createExercise({ skillId, exerciseId: newExercise.exerciseId, state: toSO(newExercise.state), active: true })
			const activeEvent = await exercise.createEvent({ progress: null })
			activeEvent.submissions = []
			exercise.events = [activeEvent]

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'startExercise' })
			return exercise
		},

		submitGroupAction: async (_source, { code, skillId, action }, { db, pubsub, getCurrentUserId }) => {
			// Load and verify data.
			const userId = getCurrentUserId()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const exercise = group.exercises[0]
			if (!exercise)
				throw new UserInputError(`Could not submit group action. The group ${group.code} does not have an active exercise.`)

			// If there is no active event (should never happen) then add one.
			let activeEvent = exercise.events.find(event => event.progress === null)
			if (!activeEvent) {
				activeEvent = await exercise.createEvent({ progress: null })
				activeEvent.submissions = []
				exercise.events = [activeEvent]
			}

			// If there is already a submission for the user, overwrite it. Otherwise add it.
			const userSubmission = activeEvent.submissions.find(submission => submission.userId === userId)
			if (userSubmission) {
				const newSubmission = await userSubmission.update({ action })
				activeEvent.submissions = activeEvent.submissions.map(submission => submission.id === newSubmission.id ? newSubmission : submission)
			} else {
				const newSubmission = await activeEvent.createSubmission({ userId, action })
				activeEvent.submissions = [...activeEvent.submissions, newSubmission]
			}

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'submitAction' })
			return exercise
		},

		cancelGroupAction: async (_source, { code, skillId }, { db, pubsub, getCurrentUserId }) => {
			// Load and verify data.
			const userId = getCurrentUserId()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const exercise = group.exercises[0]
			if (!exercise)
				throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active exercise.`)
			const activeEvent = exercise.events.find(event => event.progress === null)
			if (!activeEvent)
				throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

			// Load in the user submission and delete it if it exists.
			const userSubmission = activeEvent.submissions && activeEvent.submissions.find(submission => submission.userId === userId)
			if (userSubmission) {
				await userSubmission.destroy()
				activeEvent.submissions = activeEvent.submissions.filter(submission => submission.id !== userSubmission.id)
				await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'cancelAction' })
			}

			// Return the exercise as result.
			return exercise
		},

		resolveGroupEvent: async (_source, { code, skillId }, { db, pubsub, getCurrentUserId }) => {
			// Load and verify data.
			const userId = getCurrentUserId()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const exercise = group.exercises[0]
			if (!exercise)
				throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active exercise.`)
			const activeEvent = exercise.events.find(event => event.progress === null)
			if (!activeEvent)
				throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

			// Check if it can be submitted. This is only when at least two active members are present and all active members have submitted.
			const activeMembers = group.members.filter(member => member.groupMembership.active)
			if (activeMembers.length < 2)
				throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have sufficient users present.`)
			if (activeMembers.some(member => !activeEvent.submissions.some(submission => submission.userId === member.id)))
				throw new UserInputError(`Could not resolve group event. Not every active user in group ${group.code} has submitted an action.`)

			// Set up an updateSkills handler that only collects calls.
			const skillUpdates = []
			const updateSkills = (setup, correct, givenUserId) => {
				if (setup)
					skillUpdates.push({ setup, correct, userId: givenUserId || userId })
			}

			// Check the exercise, getting an updated progress. Store this and prepare for a new event.
			const state = toFO(exercise.state)
			const previousProgress = getGroupExerciseProgress(exercise)
			const exerciseId = fixExerciseId(exercise.exerciseId, skillId)
			const { processAction } = require(`step-wise/eduContent/${exercises[exerciseId].path.join('/')}/${getExerciseName(exerciseId)}`)
			const progress = processAction({ submissions: activeEvent.submissions, state, progress: previousProgress, history: exercise.events, updateSkills })

			// Time to store things in the database.
			let adjustedSkillsPerUser
			await db.transaction(async (transaction) => {
				// Apply all the skill updates that were collected so far.
				adjustedSkillsPerUser = await applySkillUpdates(skillUpdates, db, transaction)

				// Store the progress in the active event. If the exercise is done, note this. If not, prepare for future submissions.
				await activeEvent.update({ progress }, { transaction })
				activeEvent.progress = progress
				if (progress.done) {
					await exercise.update({ active: false }, { transaction })
					exercise.active = false
				} else {
					const newActiveEvent = await exercise.createEvent({ progress: null }, { transaction })
					newActiveEvent.submissions = []
					exercise.events = [...exercise.events, newActiveEvent]
				}
			})

			// Resolve subscriptions where needed.
			await Promise.all(Object.keys(adjustedSkillsPerUser).map(async userId => await pubsub.publish(skillEvents.skillsUpdated, { updatedSkills: adjustedSkillsPerUser[userId], userId })))
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'resolveEvent' })

			// Return the exercise as a result.
			return exercise
		},
	},

	Subscription: {
		...getSubscription('activeGroupExercisesUpdate', [groupExerciseEvents.groupExerciseUpdated], ({ updatedGroupExercise, code: codeOfEvent }, { code: codeOfFollowedGroup }) => {
			// Only pass on when the code matches.
			if (codeOfEvent === codeOfFollowedGroup)
				return updatedGroupExercise
		}),
	},
}
module.exports = resolvers

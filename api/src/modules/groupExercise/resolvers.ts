import { UserInputError } from '../../errors.ts'
import { Op } from 'sequelize'

import { findOptimum } from '@step-wise/js-utils'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'
import { getExercises, getExercise } from '@step-wise/exercises'

import { getSubscription } from '../subscriptions.ts'
import { groupEvents, getGroup, verifyGroupAccess } from '../group/index.ts'
import { skillEvents, applySkillUpdates } from '../skill/index.ts'
import { groupExerciseEvents, getGroupExerciseProgress, getGroupWithAllExercises, getGroupWithActiveExercises, getGroupWithActiveSkillExercise } from './service.ts'

type ResolverTree = { [key: string]: ResolverTree | ((...args: any[]) => any) }
export const groupExerciseResolvers: ResolverTree = {
	GroupExercise: {
		startedOn: exercise => exercise.createdAt,
		progress: exercise => getGroupExerciseProgress(exercise),
		history: exercise => exercise.events.sort((a: any, b: any) => a.createdAt - b.createdAt) || [], // Sort the history ascending by date.
	},

	GroupEvent: {
		performedAt: event => findOptimum(event.submissions.map((submission: any) => submission.updatedAt), (a: any, b: any) => a > b) || event.updatedAt, // Get the time of the last submission.
	},

	GroupSubmission: {
		performedAt: submission => submission.updatedAt,
	},

	Query: {
		activeGroupExercises: async (_source, { code }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			const group = await getGroupWithActiveExercises(code, db)
			verifyGroupAccess(group, userId)
			return group.exercises
		},
	},

	Mutation: {
		leaveGroup: async (_source, { code }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load the group and check how many users are left.
			ensureLoggedIn()
			const group = await getGroup(db, code, true)
			group.members = group.members.filter((member: any) => member.id !== userId)

			// When the group is left empty, remove it entirely. Otherwise remove all traces from the user.
			if (group.members.length === 0) {
				await group.destroy()
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'destroy' })
			} else {
				// Get all submission IDs that have to be removed.
				const groupWithExercises = await getGroupWithAllExercises(code, db)
				const exerciseList: any[] = []
				const exerciseSubmissionIdList: string[] = []
				groupWithExercises.exercises.forEach((exercise: any) => {
					// If the user never did anything in this exercise, ignore it.
					if (!exercise.events.some((event: any) => event.submissions.some((submission: any) => submission.userId === userId))) return

					// Remember the exercise and all submissions that the user did in it.
					exerciseList.push(exercise)
					exercise.events.forEach((event: any) => {
						event.submissions.forEach((submission: any) => {
							if (submission.userId === userId) exerciseSubmissionIdList.push(submission.id)
						})
						event.submissions = event.submissions.filter((submission: any) => submission.userId !== userId)
					})
				})

				// Remove the user and all its submissions. (Including the userId is technically not needed, but still wise for security reasons.)
				await group.removeMember(userId)
				await db.GroupExerciseSubmission.destroy({ where: { userId, id: { [Op.in]: exerciseSubmissionIdList } } })

				// Publish events about each of the active exercises and on the updated group.
				const activeExercises = exerciseList.filter((exercise: any) => exercise.active)
				await Promise.all(activeExercises.map(async exercise => await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'resolveEvent' })))
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'leave' })
			}

			return true
		},

		startGroupExercise: async (_source, { code, skillId }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Verify that the user is a member of the given group.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)

			// If an active group exercise already exists, return this. (So if two users start an exercise at the same time, this prevents an error.)
			if (group.exercises.length > 0) return group.exercises[0]

			// Select a new exercise, store it, and right away add an empty event to couple submissions to.
			const skillExercises = getExercises(skillId)!
			const newExercise = generateRandomExerciseInstance(skillExercises)
			const exercise = await group.createExercise({ skillId, exerciseId: newExercise.exerciseId, state: newExercise.state, active: true })
			const activeEvent = await exercise.createEvent({ progress: null })
			activeEvent.submissions = []
			exercise.events = [activeEvent]

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'startExercise' })
			return exercise
		},

		submitGroupAction: async (_source, { code, skillId, action }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not submit group action. The group ${group.code} does not have an active exercise.`)

			// If there is no active event (should never happen) then add one.
			let activeEvent = activeExercise.events.find((event: any) => event.progress === null)
			if (!activeEvent) {
				activeEvent = await activeExercise.createEvent({ progress: null })
				activeEvent.submissions = []
				activeExercise.events = [activeEvent]
			}

			// If there is already a submission for the user, overwrite it. Otherwise add it.
			const userSubmission = activeEvent.submissions.find((submission: any) => submission.userId === userId)
			if (userSubmission) {
				const newSubmission = await userSubmission.update({ action })
				activeEvent.submissions = activeEvent.submissions.map((submission: any) => submission.id === newSubmission.id ? newSubmission : submission)
			} else {
				const newSubmission = await activeEvent.createSubmission({ userId, action })
				activeEvent.submissions = [...activeEvent.submissions, newSubmission]
			}

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'submitAction' })
			return activeExercise
		},

		cancelGroupAction: async (_source, { code, skillId }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find((event: any) => event.progress === null)
			if (!activeEvent) throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

			// Load in the user submission and delete it if it exists.
			const userSubmission = activeEvent.submissions && activeEvent.submissions.find((submission: any) => submission.userId === userId)
			if (userSubmission) {
				await userSubmission.destroy()
				activeEvent.submissions = activeEvent.submissions.filter((submission: any) => submission.id !== userSubmission.id)
				await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'cancelAction' })
			}

			// Return the exercise as result.
			return activeExercise
		},

		resolveGroupEvent: async (_source, { code, skillId }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find((event: any) => event.progress === null)
			if (!activeEvent) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

			// Check if it can be submitted. This is only when at least two active members are present and all active members have submitted.
			const activeMembers = group.members.filter((member: any) => member.groupMembership.active)
			if (activeMembers.length < 2) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have sufficient users present.`)
			if (activeMembers.some((member: any) => !activeEvent.submissions.some((submission: any) => submission.userId === member.id))) throw new UserInputError(`Could not resolve group event. Not every active user in group ${group.code} has submitted an action.`)

			// Set up an updateSkills handler that only collects calls.
			const skillUpdates: any[] = []
			const updateSkills = (setup: any, correct: boolean, givenUserId?: string) => {
				if (setup) skillUpdates.push({ setup, correct, userId: givenUserId || userId })
			}

			// Check the exercise, getting an updated progress. Store this and prepare for a new event.
			const previousProgress = getGroupExerciseProgress(activeExercise)
			const exercise = getExercise(skillId, activeExercise.exerciseId)
			if (!exercise) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${activeExercise.exerciseId}".`)
			const progress = exercise.processAction({ submissions: activeEvent.submissions, state: activeExercise.state, progress: previousProgress, history: activeExercise.events, updateSkills })
			if (!progress) throw new Error(`Invalid progress object: could not process action for skill "${skillId}" exerciseId "${activeExercise.exerciseId}" due to an error in updating the exercise progress.`)

			// Time to store things in the database.
			let updatedSkillsPerUser: Record<string, any[]> = {}
			await db.transaction(async (transaction: any) => {
				// Apply all the skill updates that were collected so far.
				updatedSkillsPerUser = await applySkillUpdates(db, skillUpdates, transaction)

				// Store the progress in the active event. If the exercise is done, note this. If not, prepare for future submissions.
				await activeEvent.update({ progress }, { transaction })
				activeEvent.progress = progress
				if (progress.done) {
					await activeExercise.update({ active: false }, { transaction })
					activeExercise.active = false
				} else {
					const newActiveEvent = await activeExercise.createEvent({ progress: null }, { transaction })
					newActiveEvent.submissions = []
					activeExercise.events = [...activeExercise.events, newActiveEvent]
				}
			})

			// Resolve subscriptions where needed.
			await Promise.all(Object.keys(updatedSkillsPerUser).map(async userId => await pubsub.publish(skillEvents.skillsUpdated, { updatedSkills: updatedSkillsPerUser[userId], userId })))
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'resolveEvent' })

			// Return the exercise as a result.
			return activeExercise
		},
	},

	Subscription: {
		...getSubscription('activeGroupExercisesUpdate', [groupExerciseEvents.groupExerciseUpdated], ({ updatedGroupExercise, code: codeOfEvent }: any, { code: codeOfFollowedGroup }: any) => {
			// Only pass on when the code matches.
			if (codeOfEvent === codeOfFollowedGroup) return updatedGroupExercise
		}),
	},
}

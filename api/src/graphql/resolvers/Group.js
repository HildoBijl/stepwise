const { Op, UniqueConstraintError } = require('sequelize')
const { ForbiddenError, UserInputError } = require('apollo-server-express')

const { getSubscription } = require('../util/subscriptions')
const { events: groupEvents, getUserWithGroups, getUserGroups, getUserWithDeactivatedGroups, deactivateUserGroups, getGroup, createRandomCode } = require('../util/Group')
const { events: groupExerciseEvents, getGroupWithAllExercises } = require('../util/GroupExercise')

const resolvers = {
	Group: {
		members: group => group.getMembers(),
	},

	Member: {
		groupId: member => member.groupMembership.groupId, // This is needed for efficient caching.
		userId: member => member.id,
		active: member => member.groupMembership.active,
		lastActivity: member => member.groupMembership.updatedAt,
	},

	Query: {
		myGroups: async (_source, _args, { db, getCurrentUserId }) => {
			return await getUserGroups(db, getCurrentUserId())
		},

		groupExists: async (_source, { code }, { db }) => {
			try {
				await getGroup(db, code)
				return true
			} catch {
				return false
			}
		},

		myActiveGroup: async (_source, _args, { db, getCurrentUserId }) => {
			// Load all groups and find the active one. (Yes, a bit inefficient, but the number of groups is always small.)
			const groups = await getUserGroups(db, getCurrentUserId())
			return groups.find(group => group.groupMembership.active)
		},

		group: async (_source, { code }, { getCurrentUserId, db }) => {
			// Load the group with the given code.
			const userId = getCurrentUserId()
			const group = await getGroup(db, code)

			// Check that the user is allowed to see the group.
			const members = await group.getMembers()
			const member = members.find(member => member.id === userId)
			if (!member)
				throw new ForbiddenError('Failed to load group data: only members have access.')

			return group
		},
	},

	Mutation: {
		createGroup: async (_source, _args, { db, pubsub, getCurrentUserId }) => {
			// Create a new group with a random code. The code may already exist in the database, so we have re-try until it eventually succeeds. Even though a collision is not very likely, we still bail out at some point, otherwise the server would be blocked completely.
			const group = await (async () => {
				for (let i = 10; i > 0; --i) {
					try {
						return await db.Group.create({
							code: createRandomCode(),
						})
					} catch (e) {
						if (e instanceof UniqueConstraintError)
							continue // Try again...
						throw e
					}
				}
				throw new Error('Failed to create group: not enough unique codes remaining.')
			})()

			// Deactivate the user from other groups.
			const userId = getCurrentUserId()
			await getUserWithDeactivatedGroups(db, pubsub, userId)

			// The creator automatically joins the group.
			await group.addMember(userId, { through: { active: true } })
			group.members = await group.getMembers()
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'create' })

			return group
		},

		joinGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			// Deactivate the user from other groups.
			const userId = getCurrentUserId()
			const user = await getUserWithDeactivatedGroups(db, pubsub, userId, code)
			const groups = user.groups

			// If the user is already a member of the group, simply activate the membership.
			const existingGroup = groups.find(group => group.code === code)
			const existingMembership = existingGroup && existingGroup.members && existingGroup.members.find(member => member.id === userId).groupMembership
			if (existingMembership) {
				if (!existingMembership.active) {
					await existingMembership.update({ active: true })
					existingGroup.members = await existingGroup.getMembers()
					await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: existingGroup, userId, action: 'activate' })
				}
				return existingGroup
			}

			// Load the group and add the user.
			const group = await getGroup(db, code)
			await group.addMember(userId, { through: { active: true } })
			group.members = await group.getMembers()
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'join' })

			return group
		},

		leaveGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			// Load the group and check how many users are left.
			const userId = getCurrentUserId()
			const group = await getGroup(db, code)
			group.members = group.members.filter(member => member.id !== userId)

			// When the group is left empty, remove it entirely. Otherwise remove all traces from the user.
			if (group.members.length === 0) {
				await group.destroy()
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'destroy' })
			} else {
				// Get all submission IDs that have to be removed.
				const groupWithExercises = await getGroupWithAllExercises(code, db)
				const exerciseList = []
				const exerciseSubmissionIdList = []
				groupWithExercises.exercises.forEach(exercise => {
					// If the user never did anything in this exercise, ignore it.
					if (!exercise.events.some(event => event.submissions.some(submission => submission.userId === userId)))
						return

					// Remember the exercise and all submissions that the user did in it.
					exerciseList.push(exercise)
					exercise.events.forEach(event => {
						event.submissions.forEach(submission => {
							if (submission.userId === userId)
								exerciseSubmissionIdList.push(submission.id)
						})
						// Already remove the submission from the submission list.
						event.submissions = event.submissions.filter(submission => submission.userId !== userId)
					})
				})

				// Remove the user and all its submissions.
				await group.removeMember(userId)
				await db.GroupExerciseSubmission.destroy({
					where: {
						userId, // Technically not needed, but for added safety.
						id: {
							[Op.in]: exerciseSubmissionIdList,
						},
					},
				})

				// Publish events about each of the active exercises and on the updated group.
				const activeExercises = exerciseList.filter(exercise => exercise.active)
				await Promise.all(activeExercises.map(async exercise => await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'resolveEvent' })))
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'leave' })
			}

			// All done!
			return true
		},

		activateGroup: async (_source, { code }, { db, pubsub, getCurrentUserId }) => {
			// Deactivate the user from other groups.
			const userId = getCurrentUserId()
			const user = await getUserWithDeactivatedGroups(db, pubsub, userId, code)
			const groups = user.groups

			// Extract the given group.
			const group = groups.find(group => group.code === code)
			if (!group)
				throw new UserInputError(`Failed to activate group: user is not a member of group "${code}".`)

			// Activate the given group.
			const member = group.members.find(member => member.id === userId)
			const membership = member.groupMembership
			if (membership && !membership.active) {
				member.groupMembership = await membership.update({ active: true })
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'activate' })
			}
			return group
		},

		deactivateGroup: async (_source, _args, { db, pubsub, getCurrentUserId }) => {
			// Load all groups and ensure that they are all inactive.
			const userId = getCurrentUserId()
			const user = await getUserWithGroups(db, userId)
			const groups = user.groups

			// Find a group where the user is active, so that we may return it in the end as the deactivated group.
			const activeGroup = groups.find(group => group.members.some(member => member.id === userId && member.groupMembership.active))

			// Deactivate all groups.
			await deactivateUserGroups(pubsub, user)

			// Return the active group (if it exists) that was found earlier.
			return activeGroup
		},
	},

	Subscription: {
		...getSubscription('groupUpdate', [groupEvents.groupUpdated], ({ updatedGroup }, { code }) => {
			// Only pass on when the code matches.
			if (updatedGroup.code === code)
				return updatedGroup
		}),
		...getSubscription('myActiveGroupUpdate', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId, action }, _args, { getCurrentUserId }) => {
			// If the user caused this update, always pass the group on. The client can incorporate the data appropriately.
			const userId = getCurrentUserId()
			if (userId === eventUserId && action === 'deactivate')
				return updatedGroup

			// Pass the group on when the group is the user's active group.
			const member = updatedGroup.members && updatedGroup.members.find(member => member.id === userId)
			if (member && member.groupMembership.active)
				return updatedGroup // If the user is active in the group, send an update on this group.
		}),
		...getSubscription('myGroupsUpdate', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId }, _args, { getCurrentUserId }) => {
			// Only pass on the updated group when the user caused this event (like deactivated) or when the user is a member.
			const userId = getCurrentUserId()
			if (userId === eventUserId || (updatedGroup.members && updatedGroup.members.some(member => member.id === userId)))
				return updatedGroup
		}),
	},
}

module.exports = resolvers

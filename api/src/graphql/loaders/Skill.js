const DataLoader = require('dataloader')
const { Op } = require('sequelize')

const { processCourse, includePrerequisitesAndLinks } = require('step-wise/eduTools')

module.exports = ({ db }, { coursesWithStudent }) => ({
	// permittedSkillsForStudent takes a studentId and loads a list of skills that the given user is allowed to load for that student. It returns an object { withExercises: [...], withoutExercises: [...] }.
	permittedSkillsForStudent: new DataLoader(async studentIds => {
		const coursesPerStudent = await coursesWithStudent.loadMany(studentIds)

		// For each student, check the list of courses they're following. For each course. Add the respective skills.
		const courseSkills = {}
		const courseSkillsWithLinks = {}
		return coursesPerStudent.map(courses => {
			// Set up sets to fill up.
			const skillWithExercisesSet = new Set()
			const skillWithoutExercisesSet = new Set()

			// Walk through all courses this student is following (for the given teacher).
			courses.forEach(course => {
				// Find the skills that are part of the course.
				if (!courseSkills[course.id]) {
					courseSkills[course.id] = processCourse(course).all // Contents and prerequisites.
					courseSkillsWithLinks[course.id] = includePrerequisitesAndLinks(courseSkills[course.id]) // Everything linked to contents/prerequisites as well.
				}

				// Add the skills related to the course to the various sets.
				courseSkills[course.id].forEach(skillId => skillWithExercisesSet.add(skillId))
				courseSkillsWithLinks[course.id].forEach(skillId => skillWithoutExercisesSet.add(skillId))
			})
			return {
				withExercises: [...skillWithExercisesSet],
				withoutExercises: [...skillWithoutExercisesSet],
			}
		})
	}),

	// allSkillsForUser is the DataLoader that loads in all skills for a given user.
	allSkillsForUser: new DataLoader(async userIds => {
		// Load in all skill levels for all the given users.
		const skills = await db.UserSkill.findAll({
			where: { userId: { [Op.in]: userIds } },
		})

		// Assign each skill to the respective user.
		const skillsPerUser = {}
		skills.forEach(skill => {
			if (!skillsPerUser[skill.userId])
				skillsPerUser[skill.userId] = []
			skillsPerUser[skill.userId].push(skill)
		})

		// Return a list of skills per user.
		return userIds.map(userId => skillsPerUser[userId] ?? [])
	}),

	// skillForUser is the DataLoader that loads a given skill for a given user.
	skillForUser: new DataLoader(async userAndSkillCombinations => {
		// Load in the required skill levels for all users.
		const skills = await db.UserSkill.findAll({
			where: { [Op.or]: userAndSkillCombinations },
		})

		// Assign each skill to the respective user.
		const skillsPerUser = {}
		skills.forEach(skill => {
			if (!skillsPerUser[skill.userId])
				skillsPerUser[skill.userId] = {}
			skillsPerUser[skill.userId][skill.skillId] = skill
		})

		// Return the list in the same order as the combinations were given.
		return userAndSkillCombinations.map(({ userId, skillId }) => (skillsPerUser[userId] || {})[skillId] ?? null)
	}),
})

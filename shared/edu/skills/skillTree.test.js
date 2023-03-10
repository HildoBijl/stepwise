const { skillTree } = require('./skillTree')

describe('Skill tree:', () => {
	Object.values(skillTree).forEach(skill => {
		describe(skill.id, () => {
			it('has existing prerequisites skills', () => {
				expect(skill.prerequisites.find(prerequisite => skillTree[prerequisite] === undefined)).toBe(undefined)
			})
			it('has existing linked skills', () => {
				expect(skill.linkedSkills.find(linkedSkill => skillTree[linkedSkill] === undefined)).toBe(undefined)
			})
			it('has no duplicate linked skills', () => {
				const linkedSkillsFiltered = [...new Set(skill.linkedSkills)]
				expect(linkedSkillsFiltered.length).toBe(skill.linkedSkills.length)
			})
			it('has no linked skills that are also prerequisites', () => {
				expect(skill.linkedSkills.find(linkedSkill => skill.prerequisites.find(prerequisite => prerequisite === linkedSkill))).toBe(undefined)
			})
		})
	})
})

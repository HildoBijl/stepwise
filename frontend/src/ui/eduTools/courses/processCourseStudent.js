import { findOptimum, fromKeys } from '@step-wise/js-utils'
import { expandSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-definition'
import { getInitialSkillLevel } from '@step-wise/skill-tracking'

import { analyzeCourseProgress } from './courseAnalysis'

export function processStudentForCourse(student, courseDefinition) {
	const { skillTree } = courseDefinition
	const skills = student.skills.filter(skill => !!skillTree[skill.skillId])
	const requiredSkillIds = expandSkillIdsWithDirectPrerequisitesAndLinks(skillTree, courseDefinition.allSkillIds)
	const skillLevelSet = student.skillLevelSet
	const missingSkillIds = requiredSkillIds.filter(skillId => !skillLevelSet.hasSkillLevel(skillId))
	skillLevelSet.applyUpdates(fromKeys(missingSkillIds, () => getInitialSkillLevel()))
	const analysis = analyzeCourseProgress(courseDefinition, skillLevelSet)
	if (!analysis) throw new Error('Invalid student analysis: the constructed skill level set did not contain all data required by the course.')

	const activityPerSkill = skills.filter(skill => courseDefinition.allSkillIds.includes(skill.skillId)).map(skill => skillLevelSet.getSkillLevel(skill.skillId).coefficientsOn)
	const lastActive = findOptimum(activityPerSkill, (a, b) => a > b)
	return { ...student, skills, skillLevelSet, analysis, lastActive }
}

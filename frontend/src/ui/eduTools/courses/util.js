import { count, fromEntries, fromKeys, findOptimum } from '@step-wise/utils'
import { skillTree, includeDirectPrerequisitesAndLinks } from '@step-wise/skill-tree'
import { SkillLevelSet } from '@step-wise/skill-tracking'
import { processSkill, getDefaultSkillLevel } from 'step-wise/eduTools'

import { isPracticeNeeded } from '../skills'

// getAnalysis checks, for a given course overview and a given set of skills data, which skills have been mastered and which skill is recommended to practice next. It returns an object of the form { practiceNeeded: { skill1: 2, skill2: 0, skill3: 1, ... }, recommendation: 'skill2' }. The recommendation can also be undefined (not enough data loaded yet) or the freePractice string.
const strFreePractice = 'StepWiseFreePracticeMode'
export { strFreePractice }
export function getAnalysis(overview, skillLevelSet) {
	const practiceNeeded = getPracticeNeeded(overview, skillLevelSet)

	// Check if there are still undefined practiceNeeded. Then not all data is loaded yet. Return undefined as recommendation.
	if (overview.allSkills.some(skillId => practiceNeeded[skillId] === undefined))
		return undefined

	// Check for possible recommendations: first for work needed in prior knowledge and then for work needed in the course skills. Also ensure that this recommendation has exercises that can be practiced.
	let recommendation = overview.priorKnowledge.find(skillId => practiceNeeded[skillId] === 2 && skillTree[skillId].exercises.length > 0)
	if (!recommendation)
		recommendation = overview.contents.find(skillId => practiceNeeded[skillId] === 2 && skillTree[skillId].exercises.length > 0)
	if (!recommendation)
		recommendation = overview.contents.find(skillId => practiceNeeded[skillId] === 1 && skillTree[skillId].exercises.length > 0)

	// If no recommendation has been found, then all skills are mastered. Recommend free practice.
	if (!recommendation)
		recommendation = strFreePractice

	// Return the outcome.
	return {
		practiceNeeded,
		recommendation,
	}
}

// getPracticeNeeded takes a course set-up and walks through it to determine which skills require practice. It returns an object { skill1: 2, skill2: 0, skill3: 1, ... } which indicates the practice-needed-index for each skill in the course (including prior knowledge skills). It also takes into account the skill hierarchy: if a main skill X has an index (for instance "1") then all subskills have AT MOST that index, possibly lower.
function getPracticeNeeded(overview, skillLevelSet) {
	const result = {}
	overview.learningGoals.forEach(goalId => checkPracticeNeeded(goalId, skillLevelSet, overview.priorKnowledge, result))
	return result
}

function checkPracticeNeeded(skillId, skillLevelSet, priorKnowledge, result, bestParent) {
	// Extract the skill from the skill tree.
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)

	// Derive data about this skill.
	const isPriorKnowledge = priorKnowledge.includes(skillId)
	let practiceNeeded = isPracticeNeeded(skillLevelSet, skillId, isPriorKnowledge, skill.thresholds)
	if (bestParent !== undefined && practiceNeeded !== undefined)
		practiceNeeded = Math.min(bestParent, practiceNeeded)

	// If this was already known, end the iteration. Otherwise store the result.
	if (result[skillId] !== undefined && practiceNeeded !== undefined && result[skillId] <= practiceNeeded)
		return
	result[skillId] = practiceNeeded

	// Store, and recursively add prerequisites.
	if (!isPriorKnowledge && skill.prerequisites)
		skill.prerequisites.forEach(prerequisiteId => checkPracticeNeeded(prerequisiteId, skillLevelSet, priorKnowledge, result, practiceNeeded))
}

// processStudent takes a student (as given by the database API) and a course overview, and processes the student's skill data. It gives a complete set of skillsData objects for all the course's skills, it has an analysis on what to practice, and checks how many skills the student has completed.
export function processStudent(student, overview) {
	// Filter out outdated none-existing skills, process the remaining skills, and turn them into an ID-keyed object (a raw dataset).
	const skillsProcessed = student.skills.filter(skill => skillTree[skill.skillId]).map(skill => processSkill(skill))
	const skillsAsObject = fromEntries(skillsProcessed.map(skill => skill.skillId), skillsProcessed)

	// Add skills that are not in the data set. (These are skills that are not in the database yet.)
	const allSkillIds = includeDirectPrerequisitesAndLinks(overview.allSkills)
	const skills = fromKeys(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillLevel(skillId))
	const skillLevelSet = new SkillLevelSet(skillTree, skills)

	// Run an analysis of what the student completed.
	const analysis = getAnalysis(overview, skillLevelSet)
	const getNumCompleted = skillIds => count(skillIds, (skillId) => analysis.practiceNeeded[skillId] === 0)
	const numCompleted = getNumCompleted(overview.contents)
	const numCompletedPerBlock = overview.blocks.map(block => getNumCompleted(block.contents))

	// Determine the last activity for the student. (Use the original skills and not the newly added skills, that have more recent dates.)
	const activityPerSkill = skillsProcessed.filter(skill => overview.allSkills.includes(skill.skillId)).map(skill => skill.updatedAt)
	const lastActive = findOptimum(activityPerSkill, (a, b) => a > b)

	// Return all data.
	return { ...student, skillLevelSet, analysis, numCompleted, numCompletedPerBlock, lastActive }
}

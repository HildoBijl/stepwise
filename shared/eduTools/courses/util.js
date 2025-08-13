const { sortByIndices } = require('../../util')
const { objToSetup } = require('../../skillTracking')

const { skillTree, isSkillRequiredFor } = require('../skills')

/* processCourse takes a list of course goals and starting points and retrieves all the skillIds related to the course, in various useful lists. (Starting points are all the skills in the tree with at least one prerequisite being prior knowledge.) These include:
 * Lists for actual applications.
 * - contents: all skills part of the course. (Including goals and starting points.)
 * - goals: all goals of the course after processing.
 * - startingPoints: all starting points of the course after processing.
 * - priorKnowledge: all direct prior knowledge needed for the course.
 * - all: all skills related to the course. (Course skills and prior knowledge together.)
 * 
 * Lists for checking if the definition is sound.
 * - originalGoals: the goals that were provided, exactly as given.
 * - originalStartingPoints: the starting points that were provided, exactly as given.
 * - unknownGoals: goals that were not even known.
 * - unknownStartingPoints: starting points that were not even known.
 * - superfluousGoals: all goals that did not need to be mentioned.
 * - missingStartingPoints: all starting points that should have been added but weren't.
 * - externalStartingPoints: all starting points that are mentioned but are not required for any of the goals.
 * - superfluousStartingPoints: all starting points that did not need to be mentioned. They are those for which all prerequisites are also already part of the course.
 */
function processCourse(rawCourse) {
	const { goals: originalGoals, startingPoints: originalStartingPoints, goalWeights } = rawCourse

	// Filter out unknown skillIds.
	const unknownGoals = originalGoals.filter(goalId => !skillTree[goalId])
	const filteredGoals = originalGoals.filter(goalId => skillTree[goalId])
	const unknownStartingPoints = originalStartingPoints.filter(startingPointId => !skillTree[startingPointId])
	const filteredStartingPoints = originalStartingPoints.filter(startingPointId => skillTree[startingPointId])

	// Walk through the goals and, for each prerequisite, add the respective skills to the sets. This fills up contents, startingPoints and superfluousGoals lists.
	let contents = [], startingPoints = [], superfluousGoals = []
	const skillLists = { filteredGoals, filteredStartingPoints, contents, startingPoints, superfluousGoals }
	filteredGoals.forEach(goalId => processSkillForCourse(goalId, skillLists, true))

	// Derive various other sets based on known sets.
	const goals = filteredGoals.filter(goalId => !superfluousGoals.includes(goalId)) // Remove superfluous goals from goals.
	const missingStartingPoints = startingPoints.filter(startingPointId => !filteredStartingPoints.includes(startingPointId)) // Remove the original (filtered) starting points from all the starting points.
	const superfluousStartingPoints = startingPoints.filter(startingPointId => skillTree[startingPointId].prerequisites.length > 0 && skillTree[startingPointId].prerequisites.every(prerequisiteId => contents.includes(prerequisiteId))) // Find all starting points that have prerequisites and for which all prerequisites are also part of the course.
	startingPoints = startingPoints.filter(startingPointId => !superfluousStartingPoints.includes(startingPointId)) // Filter out superfluous starting points.
	const externalStartingPoints = filteredStartingPoints.filter(startingPointId => !contents.includes(startingPointId)) // Find all original starting points that have not been found.

	// Determine the prior knowledge: these are all the direct prerequisites of starting points that are not part of the course.
	const priorKnowledge = []
	startingPoints.forEach(startingPointId => {
		skillTree[startingPointId].prerequisites.forEach(prerequisiteId => {
			if (!contents.includes(prerequisiteId) && !priorKnowledge.includes(prerequisiteId))
				priorKnowledge.push(prerequisiteId)
		})
	})
	const all = [...priorKnowledge, ...contents]

	// Return all lists within one big object.
	return { contents, goals, startingPoints, priorKnowledge, all, originalGoals, originalStartingPoints, unknownGoals, unknownStartingPoints, superfluousGoals, missingStartingPoints, externalStartingPoints, superfluousStartingPoints, goalWeights }
}
module.exports.processCourse = processCourse

// processSkillForCourse is a helper function for processCourse. It adds a skillId and then checks if its prerequisites should be added too. It updates all the relevant skill lists.
function processSkillForCourse(skillId, skillLists, isOriginalGoal = false) {
	const { filteredGoals, filteredStartingPoints, contents, startingPoints, superfluousGoals } = skillLists

	// If we already processed this skill, don't do so again.
	if (contents.includes(skillId))
		return
	contents.push(skillId)

	// If this skill is a goal, but has not been marked as one, then it's a superfluous goal.
	if (!isOriginalGoal && filteredGoals.includes(skillId))
		superfluousGoals.push(skillId)

	// Run various checks depending on whether we're at a regular starting point, an out-of-tree skill or an in-tree skill.
	if (filteredStartingPoints.includes(skillId)) { // The skill is a starting point.
		startingPoints.push(skillId) // Mark it as a valid starting point.
		skillTree[skillId].prerequisites.forEach(prerequisiteId => filteredStartingPoints.find(startingPointId => isSkillRequiredFor(startingPointId, prerequisiteId)) && processSkillForCourse(prerequisiteId, skillLists)) // Also add those prerequisites that follow from another starting point. Ignore the rest.
	} else if (!filteredStartingPoints.find(startingPointId => isSkillRequiredFor(startingPointId, skillId))) { // The skill is a skill without any links to starting points. We're out-of-tree.
		startingPoints.push(skillId) // Add the skill as a starting point and don't continue to iterate.
	} else { // We have a regular in-tree skill.
		skillTree[skillId].prerequisites.forEach(prerequisiteId => processSkillForCourse(prerequisiteId, skillLists)) // Continue adding all prerequisites.
	}
}

// getSkillsBetween takes a list of course goals and prior knowledge and finds all skills between them (including goals and excluding prior knowledge). It does not do any checks: it assumes the lists are valid for the current skill tree.
function getSkillsBetween(goals, priorKnowledge) {
	// Set up a handler to recursively add skills.
	const contents = []
	const processSkill = skillId => {
		if (priorKnowledge.includes(skillId) || contents.includes(skillId))
			return // Ignore prior knowledge, as well as skills we considered earlier.
		contents.push(skillId)
		skillTree[skillId].prerequisites.forEach(prerequisiteId => processSkill(prerequisiteId))
	}

	// Walk through the goals to add them and then recursively add their prerequisites.
	goals.forEach(goalId => processSkill(goalId))
	return contents
}
module.exports.getSkillsBetween = getSkillsBetween

// getCourseOverview takes a course object (as given by the database API) and turns it into an overview that can be rendered properly. So it determines all contents, also per block, and puts it in the right order. It goes further than processCourse in the sense that processCourse only checks what needs to be part of the course, and this function also determines the blocks and the order.
function getCourseOverview(rawCourse) {
	// On no input, return empty lists.
	if (!rawCourse)
		return { priorKnowledge: [], goals: [], blocks: [], contents: [], all: [] }

	// Determine all that needs to be in the course.
	const processedCourse = processCourse(rawCourse)

	// Sort the prior knowledge by the order of the skills tree object. This prevents some funky situations when later on we encounter a prior-knowledge-skill that is a subskill of a skill of an earlier-encountered prior knowledge skill.
	const allSkillIds = Object.keys(skillTree)
	const indices = processedCourse.priorKnowledge.map(skillId => allSkillIds.indexOf(skillId))
	const priorKnowledgeSorted = sortByIndices(processedCourse.priorKnowledge, indices)

	// Walk through the blocks to determine what must be in each.
	const contentsSoFar = [] // Contains the contents in all blocks up to the current block.
	const blocks = rawCourse.blocks.map(block => {
		const contents = [] // Contains the contents of the current block.
		const addToBlockContents = (skillId) => {
			const skill = skillTree[skillId]
			if (!skill || priorKnowledgeSorted.includes(skillId) || contentsSoFar.includes(skillId))
				return // Ignore non-existing skills (try to render stuff anyway), prior knowledge skills and previously considered skills.
			contentsSoFar.push(skillId) // Remember this skill, to not consider it again.
			skill.prerequisites.forEach(prerequisiteId => addToBlockContents(prerequisiteId)) // Add all prerequisites first.
			contents.push(skillId) // Then add this skill.
		}
		block.goals.forEach(goalId => addToBlockContents(goalId))
		return { ...block, contents }
	})

	// In case the goals are different from the original goals, apply the proper mapping to the goalWeights array.
	const goalWeights = rawCourse.goalWeights && processedCourse.goals.map(goalId => rawCourse.goalWeights[rawCourse.goals.indexOf(goalId)])

	// Make sure that the set-up, if it exists, is a set-up object.
	const setup = rawCourse.setup && objToSetup(rawCourse.setup)

	// Return all sets as arrays.
	return {
		priorKnowledge: priorKnowledgeSorted,
		goals: processedCourse.goals,
		goalWeights,
		blocks,
		contents: blocks.map(block => block.contents).flat(), // Use the order of the skills as defined by the blocks.
		all: processedCourse.all,
		setup,
	}
}
module.exports.getCourseOverview = getCourseOverview

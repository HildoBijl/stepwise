
const { skillTree } = require('../skillTree')

// isIndirectPrerequisiteOf checks if the child is a (direct or indirect) prerequisite of the given parent skill. Both parameters are IDs.
function isSkillRequiredFor(childId, parentId) {
	if (parentId === childId)
		return true
	return !!(skillTree[parentId].prerequisites.find(prerequisiteId => isSkillRequiredFor(prerequisiteId, childId)))
}
module.exports.isSkillRequiredFor = isSkillRequiredFor

import { useParams } from 'react-router-dom'

import { ensureSkillId } from 'step-wise/edu/skills'

// useSkillId returns the skill ID extracted from the URL. If this skill ID does not exist, it throws an error.
export function useSkillId() {
	const { skillId } = useParams()
	return skillId && ensureSkillId(skillId) // Allow skillId to be undefined.
}

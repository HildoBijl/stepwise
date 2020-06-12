import React from 'react'
import { useRouteMatch } from 'react-router-dom'

import skills from 'step-wise/edu/skills'
import { useUser } from '../user'

export default function Skill() {
	const user = useUser()
	const { params } = useRouteMatch()
	const { skillId } = params
	const skill = skills[skillId]

	return <>
		<p>Welcome {user.name}. You are trying to practice the skill "{skill.name}". This has not been implemented yet.</p>
	</>

	// ToDo: implement this.
}

export function useSkillTitle() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const skill = skills[skillId]

	if (!skill)
		return 'Unknown skill'
	return skill.name
}

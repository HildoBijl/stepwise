import React from 'react'
import { Link } from 'react-router-dom'

import { skillTree } from 'step-wise/edu/skills'

import { usePaths } from 'ui/routing'
import { Par } from 'ui/components'

export default function SkillOverview() {
	const paths = usePaths()
	return <>
		<Par>This is a test system used to inspect exercises. Below you find all exercises available on the website, grouped per skill.</Par>
		<ul>
			{Object.values(skillTree).map(skill => (
				<li key={skill.id}>
					<Link to={paths.skillInspection({ skillId: skill.id })}>{skill.name}</Link>
					<ul>
						{skill.exercises.map(exerciseId => <li key={exerciseId}><Link to={paths.exerciseInspection({ exerciseId })}>{exerciseId}</Link></li>)}
					</ul>
				</li>
			))}
		</ul>
	</>
}
import React from 'react'
import { Link } from 'react-router-dom'

import { skillTree } from 'step-wise/edu/skills'

import { usePaths } from 'ui/routing'
import { Par } from 'ui/components/containers'

export default function SkillOverview() {
	const paths = usePaths()
	return <>
		<Par>Dit is een testsysteem, gemaakt om gemakkelijk opgaven mee te kunnen inspecteren. Hieronder vind je een lijst van alle aanwezige vaardigheden en bijbehorende opgaven.</Par>
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
import React from 'react'
import { Link } from 'react-router-dom'

import skills from 'step-wise/edu/skills'

import { usePaths } from 'ui/routing'
import { Par } from 'ui/components/containers'

export default function TestPage() {
	const paths = usePaths()
	return <>
		<Par>Dit is een testsysteem, gemaakt om gemakkelijk opgaven mee te kunnen inspecteren. Hieronder vind je een lijst van alle aanwezige vaardigheden en bijbehorende opgaven.</Par>
		<ul>
			{Object.values(skills).map(skill => (
				<li key={skill.id}>
					<Link to={paths.testSkill({ skillId: skill.id })}>{skill.name}</Link>
					<ul>
						{skill.exercises.map(exerciseId => <li key={exerciseId}><Link to={paths.testExercise({ exerciseId })}>{exerciseId}</Link></li>)}
					</ul>
				</li>
			))}
		</ul>
	</>
}
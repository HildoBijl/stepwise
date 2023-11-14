import React from 'react'
import { Link } from 'react-router-dom'

import { skillTree } from 'step-wise/eduTools'

import { useTranslator } from 'i18n'
import { usePaths } from 'ui/routing'
import { Par } from 'ui/components'

export function SkillOverview() {
	const translate = useTranslator()
	const paths = usePaths()
	return <>
		<Par>This is a test system used to inspect exercises. Below you find all exercises available on the website, grouped per skill.</Par>
		<ul>
			{Object.values(skillTree).map(skill => (
				<li key={skill.id}>
					<Link to={paths.skillInspection({ skillId: skill.id })}>{translate(skill.name, `${skill.id}.name`, 'eduContent/skillInfo')}</Link>
					<ul>
						{skill.exercises.map(exerciseId => <li key={exerciseId}><Link to={paths.exerciseInspection({ exerciseId })}>{exerciseId}</Link></li>)}
					</ul>
				</li>
			))}
		</ul>
	</>
}

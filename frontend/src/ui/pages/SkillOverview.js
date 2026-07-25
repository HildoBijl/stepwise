import React from 'react'
import { Link } from 'react-router-dom'

import { skillTree } from '@step-wise/skill-tree'
import { getExercises, getExamples } from '@step-wise/exercises'

import { useTranslator } from 'i18n'
import { usePaths } from 'ui/routingTools'
import { Par } from 'ui/components'

export function SkillOverview() {
	const translate = useTranslator()
	const paths = usePaths()
	return <>
		<Par>This is a test system used to inspect exercises. Below you find all exercises available on the website, grouped per skill.</Par>
		<ul>
			{Object.values(skillTree).map(skill => (
				<li key={skill.id}>
					<Link to={paths.skillInspection({ skillId: skill.id })}>{translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames')}</Link>
					<ExerciseSkillList skill={skill} />
				</li>
			))}
		</ul>
	</>
}

function ExerciseSkillList({ skill }) {
	const paths = usePaths()
	const examples = getExamples(skill.id)
	const exercises = getExercises(skill.id)
	const allExercises = { ...examples, ...exercises }
	return <ul>
		{Object.keys(allExercises).map(exerciseId => {
			const isExample = !exercises[exerciseId]
			return <li key={exerciseId}>
				<Link to={paths.exerciseInspection({ skillId: skill.id, exerciseName: exerciseId })}>{exerciseId}{isExample ? ` [example only]` : ''}</Link>
			</li>
		})}
	</ul>
}

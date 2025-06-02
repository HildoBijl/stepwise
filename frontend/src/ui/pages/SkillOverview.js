import React from 'react'
import { Link } from 'react-router-dom'

import { filterDuplicates } from 'step-wise/util'
import { skillTree, splitExerciseId } from 'step-wise/eduTools'

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
	const exercises = filterDuplicates([...skill.examples, ...skill.exercises])
	return <ul>
		{exercises.map(exerciseId => {
			const { skillId, exerciseName } = splitExerciseId(exerciseId)
			const isExample = !skill.exercises.includes(exerciseId)
			const isReference = skill.id !== skillId

			// Render the link to the skill.
			return <li key={exerciseId}>
				<Link to={paths.exerciseInspection({ skillId, exerciseName })}>{exerciseName}{isReference ? ` (at skill ${skillId})` : ''}{isExample ? ` [example only]` : ''}</Link>
			</li>
		})}
	</ul>
}

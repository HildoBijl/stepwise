import React, { useState, useEffect } from 'react'
import { useRouteMatch, Link } from 'react-router-dom'

import ExerciseLoader from '../components/ExerciseLoader'

import { usePaths } from '../routing'
import skills from 'step-wise/edu/skills'
import { getNewExercise } from 'step-wise/edu/util/exercises'

export default function Skill() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const paths = usePaths() // ToDo: remove later, once not needed.

	// Use a state to track exercise data. Generate new data on a change in skill ID.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = () => setExercise(getNewExercise(skillId))
	useEffect(startNewExercise, [skillId])

	return <>
		<p>Some possible skills to practice: <Link to={paths.skill({ skillId: 'fillIn' })}>Fill in a number</Link> - <Link to={paths.skill({ skillId: 'summation' })}>Summation</Link> - <Link to={paths.skill({ skillId: 'multiplication' })}>Multiplication</Link> - <Link to={paths.skill({ skillId: 'summationOfMultiplications' })}>Summation of multiplications</Link> - <Link to={paths.skill({ skillId: 'example' })}>Linear equation</Link>.</p>
		{exercise ? <ExerciseLoader {...exercise} startNewExercise={startNewExercise} /> : null}
	</>
}

export function useSkillTitle() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const skill = skills[skillId]

	if (!skill)
		return 'Unknown skill'
	return skill.name
}

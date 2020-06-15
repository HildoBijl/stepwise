import React, { useState, useEffect } from 'react'
import { useRouteMatch, Link } from 'react-router-dom'

import Exercise from '../components/Exercise'

import { usePaths } from '../routing'
import skills from 'step-wise/edu/skills'
import { getNewExercise, checkExerciseInput } from 'step-wise/edu/util'

export default function Skill() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const paths = usePaths() // ToDo: remove later, once not needed.

	// Set up a state to manage the exercise.
	const [exercise, setExercise] = useState(getNewExercise(skillId))
	const startNewExercise = () => setExercise(getNewExercise(skillId))

	// Reset the exercise when a new skillId is given.
	useEffect(startNewExercise, [skillId])

	return <>
		<p>Here's a sample exercise for you to try... - <Link to={paths.skill({ skillId: 'summation' })}>Summation</Link> - <Link to={paths.skill({ skillId: 'multiplication' })}>Multiplication</Link>.</p>
		<Exercise {...exercise} startNewExercise={startNewExercise} />
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

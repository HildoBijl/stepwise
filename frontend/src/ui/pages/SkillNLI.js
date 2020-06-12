import React, { useState, useEffect } from 'react'
import { useRouteMatch, Link } from 'react-router-dom'

import Exercise from '../components/Exercise'

import { usePaths } from '../routing'
import { getNewExercise, checkExerciseInput } from 'step-wise/edu/util'

export default function SkillNLI() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const paths = usePaths() // ToDo: remove later, once not needed.

	// Set up a state to manage the exercise.
	const [exercise, setExercise] = useState(getNewExercise(skillId))
	const [status, setStatus] = useState('started')
	const resetExercise = () => {
		setExercise(getNewExercise(skillId))
		setStatus('started')
	}

	// Reset the exercise when a new skillId is given.
	useEffect(resetExercise, [skillId])

	// Set up handlers for the exercise.
	const functions = {
		split: () => setStatus('split'),
		giveUp: () => setStatus('givenUp'),
		submit: input => {
			const result = checkExerciseInput(exercise.id, exercise.state, input)
			if (result)
				setStatus(status === 'split' ? 'splitSolved' : 'solved')
		},
		newExercise: resetExercise,
	}

	return <>
		<p>Here's a sample exercise for you to try... - <Link to={paths.skill({ skillId: 'summation' })}>Summation</Link> - <Link to={paths.skill({ skillId: 'multiplication' })}>Multiplication</Link>.</p>
		<Exercise {...exercise} status={status} {...functions} />
	</>
}



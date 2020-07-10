import React, { useEffect, useState, useCallback } from 'react'
import { useRouteMatch, Link as RouterLink } from 'react-router-dom'
import { Link } from '@material-ui/core'
import { v4 as uuidv4 } from 'uuid'

import skills from 'step-wise/edu/skills'
import { getNewExercise } from 'step-wise/edu/util/exercises'
import { IOtoFO, FOtoIO } from 'step-wise/edu/inputTransformation'
import ExerciseContainer from '../components/ExerciseContainer'
import { usePaths } from '../routing'
import { useUserResults } from '../user'
import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from '../api/skill'
import Loading from '../components/Loading'
import Error from '../components/Error'

export default function Skill() {
	const { loading, data } = useUserResults()
	const paths = usePaths() // ToDo: remove later, once not needed.

	if (loading)
		return <Loading text="Loading user data." />

	const user = data.me
	return <>
		<p>Some possible skills to practice: <Link component={RouterLink} to={paths.skill({ skillId: 'fillInInteger' })}>Fill in an integer</Link> - <Link component={RouterLink} to={paths.skill({ skillId: 'summation' })}>Summation</Link> - <Link component={RouterLink} to={paths.skill({ skillId: 'multiplication' })}>Multiplication</Link> - <Link component={RouterLink} to={paths.skill({ skillId: 'summationOfMultiplications' })}>Summation of multiplications</Link> - <Link component={RouterLink} to={paths.skill({ skillId: 'example' })}>Linear equation</Link>.</p>
		{user ? <SkillForUser /> : <SkillForStranger />}
	</>
}

function SkillForUser() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const { loading, error, data } = useSkillQuery(skillId)
	const [submitActionToServer, { loading: submissionLoading, error: submissionError }] = useSubmitExerciseActionMutation(skillId)
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExerciseMutation(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		startNewExerciseOnServer()
	}, [startNewExerciseOnServer])
	const submitAction = useCallback((action, processAction) => {
		// ToDo later: implement processAction, if it's given, to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const exercise = data && data.skill && data.skill.currentExercise
	useEffect(() => {
		if (!loading && !exercise)
			startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Any errors we should notify the user of?
	if (error)
		return <Error data={error} />
	if (submissionError)
		return <Error data={submissionError} />
	if (newExerciseError)
		return <Error data={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <Loading text="Loading skill data." />
	if (newExerciseLoading)
		return <Loading text="Generating new exercise." />
	if (!exercise)
		return <Loading text="No exercise yet. Generating one." />

	// All fine! Display the exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} skillId={skillId} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}

function SkillForStranger() {
	const { params } = useRouteMatch()
	const { skillId } = params

	// Use a state to track exercise data. Generate new data on a change in skill ID.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		const newExercise = getNewExercise(skillId)
		const exercise = { // Emulate the exercise object that we otherwise get from the server.
			exerciseId: newExercise.exerciseId,
			state: FOtoIO(newExercise.state), // The state should be in input format, as if it came from the database.
			id: uuidv4(), // Just generate a random one.
			active: true,
			progress: {},
			history: [],
			startedOn: new Date(),
		}
		setExercise(exercise)
	}, [skillId])
	useEffect(startNewExercise, [skillId])

	// On a submit handle the process as would happen on the server: find the new progress and incorporate it into the exercise data and its history.
	const submitAction = useCallback((action, processAction) => {
		const progress = processAction({ action, state: IOtoFO(exercise.state), progress: exercise.progress })
		setExercise({
			...exercise,
			active: exercise.active && !progress.done,
			progress,
			history: [...exercise.history, {
				action,
				progress,
				performedAt: new Date(),
			}],
		})
	}, [exercise, setExercise])

	if (!exercise)
		return <Loading text="Generating new exercise" />

	// ToDo: add a banner indicating that the user is not logged in.

	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} skillId={skillId} submitting={false} submitAction={submitAction} startNewExercise={startNewExercise} />
}

export function useSkillTitle() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const skill = skills[skillId]

	if (!skill)
		return 'Unknown skill'
	return skill.name
}

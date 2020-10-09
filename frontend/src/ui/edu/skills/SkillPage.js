import React, { useEffect, useState, useCallback } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { makeStyles } from '@material-ui/core/styles'

import skills from 'step-wise/edu/skills'
import { setIOtoFO, setFOtoIO } from 'step-wise/inputTypes'
import { getNewExercise } from 'step-wise/edu/exercises/util/selection'

import { useUserResults } from 'api/user'
import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from 'api/skill'
import LoadingNote from 'ui/components/LoadingNote'
import ErrorNote from 'ui/components/ErrorNote'

import { useSkillData } from './SkillCacher'
import SkillFlask from './SkillFlask'
import ExerciseContainer from '../exercises/ExerciseContainer'

export default function SkillPage() {
	const { loading, data } = useUserResults()

	if (loading)
		return <LoadingNote text="Loading user data." />

	const user = (data && data.me) || null
	if (user)
		return <SkillForUser />
	return <SkillForStranger />
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
		return <ErrorNote error={error} />
	if (submissionError)
		return <ErrorNote error={submissionError} />
	if (newExerciseError)
		return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text="Loading skill data." />
	if (newExerciseLoading)
		return <LoadingNote text="Generating new exercise." />
	if (!exercise)
		return <LoadingNote text="No exercise yet. Generating one." />

	// All fine! Display the exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}

function SkillForStranger() {
	const { params } = useRouteMatch()
	const { skillId } = params

	// Use a state to track exercise data. Generate new data on a change in skill ID.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		async function startNewExerciseAsync() {
			const newExercise = await getNewExercise(skillId)
			const exercise = { // Emulate the exercise object that we otherwise get from the server.
				exerciseId: newExercise.exerciseId,
				state: setFOtoIO(newExercise.state), // The state should be in input format, as if it came from the database.
				id: uuidv4(), // Just generate a random one.
				active: true,
				progress: {},
				history: [],
				startedOn: new Date(),
			}
			setExercise(exercise)
		}
		startNewExerciseAsync()
	}, [skillId])
	useEffect(startNewExercise, [skillId])

	// On a submit handle the process as would happen on the server: find the new progress and incorporate it into the exercise data and its history.
	const submitAction = useCallback((action, processAction) => {
		const progress = processAction({ action, state: setIOtoFO(exercise.state), progress: exercise.progress, history: exercise.history })
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
		return <LoadingNote text="Generating new exercise" />

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

const useStyles = makeStyles((theme) => ({
	skillIndicator: { // Match the toolbar style boundaries.
		height: '34px',
		marginLeft: theme.spacing(2),
		width: '34px',
		[`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
			height: '28px',
			width: '28px',
		},
		[theme.breakpoints.up('sm')]: {
			height: '40px',
			width: '40px',
		},
	},
}))

export function SkillIndicator() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const skill = useSkillData(skillId)
	const classes = useStyles()

	// Check if we have data.
	if (!skill)
		return null

	return <SkillFlask className={classes.skillIndicator} coef={skill.coefficients} strongShadow={true} />
}
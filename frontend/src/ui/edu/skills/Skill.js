import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { makeStyles } from '@material-ui/core/styles'

import { noop } from 'step-wise/util/functions'
import { toFO, toSO } from 'step-wise/inputTypes'
import { skillTree, ensureSkillId } from 'step-wise/edu/skills'
import { getNewRandomExercise } from 'step-wise/edu/exercises/util/selection'

import { useUserResult, useUser } from 'api/user'
import { useActiveGroupResult, useActiveGroup, useActiveGroupExercisesResult, useActiveGroupExerciseForSkill, useStartGroupExerciseMutation, useSubmitGroupActionMutation, useCancelGroupActionMutation, useResolveGroupEventMutation } from 'api/group'
import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from 'api/skill'
import { TitleItem } from 'ui/layout/Title'
import LoadingNote from 'ui/components/flow/LoadingNote'
import ErrorNote from 'ui/components/flow/ErrorNote'

import { useSkillData } from './SkillCacher'
import SkillFlask from './SkillFlask'
import ExerciseContainer from '../exercises/ExerciseContainer'

export default function Skill() {
	const { loading: userLoading } = useUserResult()
	const { loading: groupLoading } = useActiveGroupResult()
	const user = useUser()
	const activeGroup = useActiveGroup()

	if (userLoading || groupLoading)
		return <LoadingNote text="Loading user data." />

	if (activeGroup)
		return <SkillForGroup />
	if (user)
		return <SkillForUser />
	return <SkillForStranger />
}

function SkillForGroup() {
	// Load in the skill and its exercises.
	const group = useActiveGroup()
	const skillId = useSkillId()
	const skill = skillTree[skillId]
	const hasExercises = skill.exercises.length > 0
	const [requestedNextExercise, setRequestedNextExercise] = useState(false)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartGroupExerciseMutation(group.code, skillId)
	const [submitActionToServer, { error: submissionError }] = useSubmitGroupActionMutation(group.code, skillId)
	const [cancelAction, { error: cancelError }] = useCancelGroupActionMutation(group.code, skillId)
	const [resolveEvent, { loading: resolveLoading, error: resolveError }] = useResolveGroupEventMutation(group.code, skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises) {
			setRequestedNextExercise(true)
			startNewExerciseOnServer()
		}
	}, [startNewExerciseOnServer, hasExercises])
	const submitAction = useCallback((action, processAction) => {
		// ToDo later: implement processAction, if it's given, to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const { loading, error } = useActiveGroupExercisesResult()
	const exercise = useActiveGroupExerciseForSkill(skillId)
	useEffect(() => {
		if (!loading && !exercise)
			startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Even when there is a new exercise, still show the previous exercise until the user requested the next exercise.
	const displayExerciseRef = useRef()
	if (exercise && (!displayExerciseRef.current || displayExerciseRef.current.id === exercise.id))
		displayExerciseRef.current = exercise
	useEffect(() => {
		if (requestedNextExercise && displayExerciseRef.current !== exercise) {
			displayExerciseRef.current = exercise
			setRequestedNextExercise(false)
		}
	}, [requestedNextExercise, displayExerciseRef, exercise])
	const displayExercise = requestedNextExercise ? exercise : displayExerciseRef.current

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>Helaas ... er zijn nog geen opgaven voor deze vaardigheid toegevoegd. Ze komen er zo snel mogelijk aan. Kom later nog eens terug!</div>

	// Any errors we should notify the user of?
	const presentError = error && newExerciseError && submissionError && cancelError && resolveError
	if (presentError)
		return <ErrorNote error={presentError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text="Loading exercise data." />
	if (newExerciseLoading)
		return <LoadingNote text="Generating new exercise." />
	if (!displayExercise)
		return <LoadingNote text="No exercise yet. Generating one." />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={displayExercise.startedOn} exercise={displayExercise} groupExercise={true} submitting={resolveLoading} submitAction={submitAction} cancelAction={cancelAction} resolveEvent={resolveEvent} startNewExercise={startNewExercise} />
}

function SkillForUser() {
	// Load in the skill and its exercises.
	const skillId = useSkillId()
	const skill = skillTree[skillId]
	const hasExercises = skill.exercises.length > 0

	// Load the exercise the user has open.
	const { loading, error, data } = useSkillQuery(skillId)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExerciseMutation(skillId)
	const [submitActionToServer, { loading: submissionLoading, error: submissionError }] = useSubmitExerciseActionMutation(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises)
			startNewExerciseOnServer()
	}, [startNewExerciseOnServer, hasExercises])
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

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>Helaas ... er zijn nog geen opgaven voor deze vaardigheid toegevoegd. Ze komen er zo snel mogelijk aan. Kom later nog eens terug!</div>

	// Any errors we should notify the user of?
	if (error)
		return <ErrorNote error={error} />
	if (submissionError)
		return <ErrorNote error={submissionError} />
	if (newExerciseError)
		return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text="Loading exercise data." />
	if (newExerciseLoading)
		return <LoadingNote text="Generating new exercise." />
	if (!exercise)
		return <LoadingNote text="No exercise yet. Generating one." />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}

function SkillForStranger() {
	const skillId = useSkillId()
	const skill = skillTree[skillId]
	const hasExercises = skill.exercises.length > 0

	// Use a state to track exercise data. Generate new data on a change in skill ID.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		async function startNewExerciseAsync() {
			const newExercise = await getNewRandomExercise(skillId)
			const exercise = { // Emulate the exercise object that we otherwise get from the server.
				exerciseId: newExercise.exerciseId,
				state: toSO(newExercise.state), // The state should be in storage format, as if it came from the database.
				id: uuidv4(), // Just generate a random one.
				active: true,
				progress: {},
				history: [],
				startedOn: new Date(),
			}
			setExercise(exercise)
		}
		if (hasExercises)
			startNewExerciseAsync()
	}, [hasExercises, skillId])

	// Start a new exercise whenever the skillId changes.
	useEffect(startNewExercise, [startNewExercise, skillId])

	// On a submit handle the process as would happen on the server: find the new progress and incorporate it into the exercise data and its history.
	const submitAction = useCallback((action, processAction) => {
		const progress = processAction({ action, state: toFO(exercise.state), progress: exercise.progress, history: exercise.history, updateSkills: noop })
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

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>Helaas ... er zijn nog geen opgaven voor deze vaardigheid toegevoegd. Ze komen er zo snel mogelijk aan. Kom later nog eens terug!</div>

	// Is there no exercise loaded yet?
	if (!exercise)
		return <LoadingNote text="Generating new exercise." />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} skillId={skillId} submitting={false} submitAction={submitAction} startNewExercise={startNewExercise} />
}

export function SkillName() {
	const skillId = useSkillId() // ToDo later: add error handling if skill ID is not known.
	const skill = skillTree[skillId]
	return <TitleItem name={skill?.name || 'Unknown skill'} />
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
	const { skillId } = useParams()
	const skill = useSkillData(skillId)
	const classes = useStyles()

	// Check if we have data.
	if (!skill)
		return null

	return <SkillFlask className={classes.skillIndicator} coef={skill.coefficients} strongShadow={true} />
}

// useSkillId returns the skill ID extracted from the URL. If this skill ID does not exist, it throws an error.
export function useSkillId() {
	const { skillId } = useParams()
	return skillId && ensureSkillId(skillId) // Allow skillId to be undefined.
}
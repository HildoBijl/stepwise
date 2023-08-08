// This component can be given an exerciseId. It then displays a sample of this exercise without connecting to any database whatsoever. It is unconnected.

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { toFO, toSO } from 'step-wise/inputTypes'
import { noop } from 'step-wise/util'

import { LoadingNote, ErrorNote } from 'ui/components/flow'
import { TitleItem } from 'ui/layout/Title'

import ExerciseContainer from './ExerciseContainer'

export default function BlankExercise() {
	const { exerciseId } = useParams()
	if (!exerciseId)
		return <ErrorNote text="Er is geen opgave in de URL opgegeven." />
	return <BlankExerciseInner exerciseId={exerciseId} />
}

function BlankExerciseInner({ exerciseId }) {
	// Make sure that the exercise is loaded.
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const ExerciseShared = useRef({})
	const reload = () => {
		setLoading(true)
		setError(false)
		import(/* webpackChunkName: "shared-exercises-6" */ `step-wise/edu/exercises/exercises/${exerciseId}`).then(importedModule => {
			ExerciseShared.current = importedModule.default
			setLoading(false)
		}).catch((err) => {
			console.error(err) // ToDo later: properly process errors.
			setError(true)
		})
	}
	useEffect(reload, [exerciseId])

	// Make sure there is exercise data, like a state, progress and such.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		if (!loading && !error) {
			setExercise({ // Emulate the exercise object that we otherwise get from the server.
				exerciseId,
				state: toSO(ExerciseShared.current.generateState()), // The state should be in storage format, as if it came from the database.
				id: uuidv4(), // Just generate a random one.
				active: true,
				progress: {},
				history: [],
				startedOn: new Date(),
			})
		}
	}, [exerciseId, loading, error])
	useEffect(startNewExercise, [startNewExercise])

	// Set up a submit handler. Do the same as would happen on the server: find the new progress and incorporate it into the exercise data and its history.
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

	// Show error/loading notes when appropriate.
	if (error)
		return <ErrorNote text="De opgave kon niet geladen worden. Controleer of hij wel bestaat." />
	if (loading || !exercise)
		return <LoadingNote text="Generating new exercise." />

	// No loading/error notes: show the exercise! Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} submitting={false} submitAction={submitAction} startNewExercise={startNewExercise} />
}

export function ExerciseName() {
	const { exerciseId } = useParams()
	return <TitleItem name={exerciseId} />
}
// This component can be given an exerciseId. It then displays a sample of this exercise without connecting to any database whatsoever. It is unconnected.

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { noop } from '@step-wise/js-utils'
import { ensureSkillId } from '@step-wise/module-tree'
import { getExercise } from '@step-wise/exercises'
import { useTranslation } from '@step-wise/i18n'

import { TranslationSection } from 'i18n'
import { LoadingNote, ErrorNote } from 'ui/components/flow'
import { TitleItem } from 'ui/routingTools'

import { ModuleTranslationScope } from '../../skills/components'

import { ExerciseContainer } from './ExerciseContainer'

export function BlankExercise() {
	const missingExerciseName = useTranslation({ folder: ['eduTools'], catalog: 'exercises', group: ['loadingNotes'], id: 'missingExerciseName', children: 'The URL has no exercise name in it.' })
	const { skillId: skillIdFromUrl, exerciseName } = useParams()
	const skillId = skillIdFromUrl && ensureSkillId(skillIdFromUrl, { allowCaseInsensitiveMatch: true })
	if (!exerciseName)
		return <ErrorNote text={missingExerciseName} />
	return <ModuleTranslationScope moduleId={skillId}>
		<TranslationSection entry="practice">
			<BlankExerciseInner skillId={skillId} exerciseId={exerciseName} />
		</TranslationSection>
	</ModuleTranslationScope>
}

function BlankExerciseInner({ skillId, exerciseId }) {
	const loadingError = useTranslation({ folder: ['eduTools'], catalog: 'exercises', group: ['loadingNotes'], id: 'loadingError', children: 'The exercise failed to load. Please check if the exercise ID is correct.' })
	const loadingExercise = useTranslation({ folder: ['eduTools'], catalog: 'exercises', group: ['loadingNotes'], id: 'loadingExercise', children: 'Loading the exercise...' })
	const exerciseDefinition = useMemo(() => getExercise(skillId, exerciseId), [skillId, exerciseId])

	// Make sure there is exercise data, such as parameters and state.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(async () => {
		if (exerciseDefinition) {
			const parameters = await exerciseDefinition.generateParameters({ example: false, context: undefined })
			const initialState = await exerciseDefinition.getInitialState({ parameters, context: undefined })
			setExercise({ // Emulate the exercise object that we otherwise get from the server.
				exerciseId: exerciseId,
				mode: 'solo',
				parameters,
				initialState,
				id: uuidv4(), // Just generate a random one.
				active: true,
				state: initialState,
				history: [],
				startedAt: new Date(),
			})
		}
	}, [exerciseId, exerciseDefinition])
	useEffect(() => { void startNewExercise() }, [startNewExercise])

	// Set up a submit handler. Do the same as would happen on the server: find the new state and incorporate it into the exercise data and its history.
	const submitAction = useCallback(async (action, processSoloAction) => {
		const { state, report } = await processSoloAction({ parameters: exercise.parameters, context: undefined, state: exercise.state, action, updateSkills: noop })
		setExercise({
			...exercise,
			active: exercise.active && !state.done,
			state,
			history: [...exercise.history, { action, state, ...(report === undefined ? {} : { report }), performedAt: new Date() }],
		})
	}, [exercise, setExercise])

	// Show error/loading notes when appropriate.
	if (!exerciseDefinition)
		return <ErrorNote text={loadingError} />
	if (!exercise)
		return <LoadingNote text={loadingExercise} />

	// No loading/error notes: show the exercise! Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedAt} skillId={skillId} exercise={exercise} submitting={false} submitAction={submitAction} processActionsLocally={true} startNewExercise={startNewExercise} />
}

export function ExerciseName() {
	const { skillId, exerciseName } = useParams()
	return <TitleItem name={`${skillId}.${exerciseName}`} />
}

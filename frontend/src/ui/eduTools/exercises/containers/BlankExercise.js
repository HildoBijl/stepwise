// This component can be given an exerciseId. It then displays a sample of this exercise without connecting to any database whatsoever. It is unconnected.

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { noop } from '@step-wise/js-utils'
import { ensureSkillId, getSkill } from '@step-wise/skill-tree'
import { getExercise } from '@step-wise/exercises'

import { TranslationFile, TranslationSection, useTranslator } from 'i18n'
import { LoadingNote, ErrorNote } from 'ui/components/flow'
import { TitleItem } from 'ui/routingTools'

import { ExerciseContainer } from './ExerciseContainer'

export function BlankExercise() {
	const translate = useTranslator()
	const { skillId: skillIdFromUrl, exerciseName } = useParams()
	const skillId = skillIdFromUrl && ensureSkillId(skillIdFromUrl, { allowCaseInsensitiveMatch: true })
	if (!exerciseName)
		return <ErrorNote text={translate('The URL has no exercise name in it.', 'loadingNotes.missingExerciseName', 'eduTools/exercises')} />
	const skill = getSkill(skillId)
	return <TranslationFile path={`eduContent/${skill.groupPath.join('/')}/${skill.id}`}>
		<TranslationSection entry="practice">
			<BlankExerciseInner skillId={skillId} exerciseId={exerciseName} />
		</TranslationSection>
	</TranslationFile>
}

function BlankExerciseInner({ skillId, exerciseId }) {
	const translate = useTranslator()
	const exerciseDefinition = useMemo(() => getExercise(skillId, exerciseId), [skillId, exerciseId])

	// Make sure there is exercise data, such as parameters and state.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		if (exerciseDefinition) {
			const parameters = exerciseDefinition.generateParameters()
			const initialState = exerciseDefinition.getInitialState(parameters)
			setExercise({ // Emulate the exercise object that we otherwise get from the server.
				exerciseId: exerciseId,
				mode: 'solo',
				parameters,
				initialState,
				id: uuidv4(), // Just generate a random one.
				active: true,
				state: initialState,
				history: [],
				startedOn: new Date(),
			})
		}
	}, [exerciseId, exerciseDefinition])
	useEffect(startNewExercise, [startNewExercise])

	// Set up a submit handler. Do the same as would happen on the server: find the new state and incorporate it into the exercise data and its history.
	const submitAction = useCallback((action, processSoloAction) => {
		const state = processSoloAction({ parameters: exercise.parameters, state: exercise.state, action, updateSkills: noop })
		setExercise({
			...exercise,
			active: exercise.active && !state.done,
			state,
			history: [...exercise.history, { action, state, performedAt: new Date() }],
		})
	}, [exercise, setExercise])

	// Show error/loading notes when appropriate.
	if (!exerciseDefinition)
		return <ErrorNote text={translate('The exercise failed to load. Please check if the exercise ID is correct.', 'loadingNotes.loadingError', 'eduTools/exercises')} />
	if (!exercise)
		return <LoadingNote text={translate('Loading the exercise...', 'loadingNotes.loadingExercise', 'eduTools/exercises')} />

	// No loading/error notes: show the exercise! Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} skillId={skillId} exercise={exercise} submitting={false} submitAction={submitAction} startNewExercise={startNewExercise} />
}

export function ExerciseName() {
	const { skillId, exerciseName } = useParams()
	return <TitleItem name={`${skillId}.${exerciseName}`} />
}

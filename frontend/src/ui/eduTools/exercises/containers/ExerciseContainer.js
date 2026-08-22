import React, { useState, createContext, useContext, useEffect, useRef, useMemo } from 'react'

import { deserializeAll } from '@step-wise/serialization'
import { getLastState } from '@step-wise/exercise-definition'
import { getSkill } from '@step-wise/skill-tree'
import { getExercise } from '@step-wise/exercises'

import { useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.
import { useTranslator } from 'i18n'
import { LoadingNote, ErrorBoundary } from 'ui/components/flow'

const exerciseModules = import.meta.glob('/src/ui/eduContent/**/exercises/*.js')

const ExerciseContext = createContext({})
export { ExerciseContext } // Exported for testing purposes.

export function ExerciseContainer({ skillId, exercise, groupExercise, submitting, submitAction, cancelAction, resolveEvent, startNewExercise, example, inspection, historyIndex }) {
	const translate = useTranslator()
	const { exerciseId, parameters } = exercise
	const mode = exercise.mode ?? (groupExercise ? 'group' : 'solo')
	const instance = useMemo(() => exercise.mode === mode ? exercise : { ...exercise, mode }, [exercise, mode])
	const [loading, setLoading] = useState(true)
	const ExerciseLocal = useRef(null)
	const ExerciseShared = useRef({})

	// Whenever the exercise ID changes, reload the component.
	const reload = () => {
		const skill = getSkill(skillId)
		setLoading(true)
		const loadExercise = exerciseModules[`/src/ui/eduContent/${skill.groupPath.join('/')}/${skill.id}/exercises/${exerciseId}.js`]
		Promise.all([
			loadExercise ? loadExercise() : Promise.reject(new Error(`No front-end exercise module found for exercise "${exerciseId}" in skill "${skillId}".`)),
		]).then(importedModules => {
			const [localModule] = importedModules
			ExerciseLocal.current = localModule.default
			ExerciseShared.current = getExercise(skillId, exerciseId)
			setLoading(false)
		}).catch((error) => {
			console.error('Exercise failed to load.')
			console.error(error) // ToDo later: properly process errors.
			throw error
		})
	}
	useEffect(reload, [setLoading, skillId, exerciseId])

	// Assemble the parameters as Functional Object.
	const parametersFO = useMemo(() => deserializeAll(parameters), [parameters])

	// Ensure that the state has a consistent reference.
	const state = useConsistentValue(inspection ? (exercise.history[historyIndex]?.state ?? exercise.initialState) : getLastState(instance))

	if (loading)
		return <LoadingNote text={translate('Loading exercise component...', 'loadingNotes.loadingExerciseComponent', 'eduTools/pages/skillPage')} />

	// Set up data for the exercise and put it in a context around the exercise.
	const exerciseData = {
		instance,
		skillId,
		exerciseId,
		parameters: parametersFO,
		example,
		inspection,
		historyIndex,
		groupExercise,
		mode,
		history: exercise.history,
		state,
		submitting,
		submitAction: (action) => submitAction(action, mode === 'group' ? ExerciseShared.current.processGroupActions : ExerciseShared.current.processSoloAction), // Incorporate the reducer for Stranger-mode and for optimistic responses.
		cancelAction,
		resolveEvent,
		startNewExercise,
		shared: ExerciseShared.current,
		metaData: ExerciseShared.current.metaData,
	}

	const Exercise = ExerciseLocal.current
	return (
		<ExerciseContext.Provider value={exerciseData}>
			<ErrorBoundary text={translate('Oops ... the exercise crashed.', 'loadingNotes.exerciseCrashed', 'eduTools/pages/skillPage')}>
				<Exercise />
			</ErrorBoundary>
		</ExerciseContext.Provider>
	)
}

export function useExerciseData() {
	return useContext(ExerciseContext)
}

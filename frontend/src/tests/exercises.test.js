import React from 'react'
import { render } from '@testing-library/react'

import skills from 'step-wise/edu/skills'
import { getAllExercises } from 'step-wise/edu/util/exercises/selection'
import { noop } from 'step-wise/util/functions'
import { ExerciseContext } from '../ui/practice/ExerciseContainer'

it('all exercises have an appropriate shared export', async () => {
	const exercises = getAllExercises()
	await exercises.forEach(async exerciseId => {
		const exercise = (await import(`step-wise/edu/exercises/${exerciseId}`)).default
		expect(typeof exercise.data).toBe('object')
		expect(typeof exercise.generateState).toBe('function')
		expect(typeof exercise.processAction).toBe('function')
	})
})

it('all exercises have a front-end exercise component', async () => {
	const exercises = getAllExercises()
	await exercises.forEach(async exerciseId => {
		const Exercise = (await import(`../ui/practice/exercises/${exerciseId}`)).default
		expect(typeof Exercise).toBe('function')
	})
})

it('all exercises render properly', async () => {
	await Object.values(skills).forEach(async skill => { // We must browse through skills here too because the exercise requires the skillId.
		await Object.values(skill.exercises).forEach(async exerciseId => {
			const shared = (await import(`step-wise/edu/exercises/${exerciseId}`)).default
			const Exercise = (await import(`../ui/practice/exercises/${exerciseId}`)).default
			expect(typeof Exercise).toBe('function')

			// Emulate the ExerciseContainer.
			const exerciseData = {
				state: shared.generateState(),
				history: [],
				progress: {},
				submitting: false,
				submitAction: (action) => submitAction(action, shared.processAction),
				startNewExercise: noop,
				shared: shared,
				skillId: skill.id,
			}
			expect(() => render(
				<ExerciseContext.Provider value={exerciseData}>
					<Exercise />
				</ExerciseContext.Provider>
			)).not.toThrow()
		})
	})
})
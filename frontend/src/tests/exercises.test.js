import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@material-ui/core/styles'

import { getAllExercises } from 'step-wise/edu/exercises/util/selection'
import { noop } from 'step-wise/util/functions'

import { ExerciseContext } from 'ui/edu/exercises/ExerciseContainer'
import FieldController from 'ui/form/FieldController'
import theme from 'ui/theme'

describe('Check all exercises:', () => {
	const exercises = getAllExercises()
	exercises.forEach(exerciseId => {
		describe(exerciseId, () => {
			it('has a front-end exercise component', async () => {
				const Exercise = (await import(`../ui/edu/exercises/exercises/${exerciseId}`)).default
				expect(typeof Exercise).toBe('function')
			})

			it('renders properly', async () => {
				const shared = (await import(`step-wise/edu/exercises/exercises/${exerciseId}`)).default
				const Exercise = (await import(`../ui/edu/exercises/exercises/${exerciseId}`)).default

				// Emulate the ExerciseContainer.
				const exerciseData = {
					state: shared.generateState(),
					history: [],
					progress: {},
					submitting: false,
					submitAction: noop, // (action) => submitAction(action, shared.processAction),
					startNewExercise: noop,
					shared: shared,
				}
				expect(() => render(
					<ThemeProvider theme={theme}>
						<FieldController>
							<ExerciseContext.Provider value={exerciseData}>
								<Exercise />
							</ExerciseContext.Provider>
						</FieldController>
					</ThemeProvider>
				)).not.toThrow()
			})
		})
	})
})
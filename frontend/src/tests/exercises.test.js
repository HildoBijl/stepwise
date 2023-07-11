import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@material-ui/core/styles'
import ResizeObserver from 'resize-observer-polyfill'

import { getAllExercises } from 'step-wise/edu/exercises/util/selection'
import { noop } from 'step-wise/util/functions'

import ModalManager from 'ui/components/Modal/ModalManager'
import theme from 'ui/theme'
import { FieldController } from 'ui/form'
import { ExerciseContext } from 'ui/edu/exercises/ExerciseContainer'

// Polyfill the react-resize-detector.
window.ResizeObserver = ResizeObserver

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
				const state = shared.generateState()
				const exerciseData = {
					state,
					history: [],
					progress: {},
					submitting: false,
					submitAction: noop, // (action) => submitAction(action, shared.processAction),
					startNewExercise: noop,
					shared: shared,
					solution: shared.getSolution && shared.getSolution(state),
				}
				expect(() => render(
					<ThemeProvider theme={theme}>
						<FieldController>
							<ModalManager>
								<ExerciseContext.Provider value={exerciseData}>
									<Exercise />
								</ExerciseContext.Provider>
							</ModalManager>
						</FieldController>
					</ThemeProvider>
				)).not.toThrow()
			})
		})
	})
})
import React from 'react'
import { render } from '@testing-library/react'
import ResizeObserver from 'resize-observer-polyfill'
import { ThemeProvider } from '@mui/material/styles'

import { noop } from 'step-wise/util'
import { exercises, assembleSolution, getExerciseName } from 'step-wise/eduTools'

import { I18nProvider, TranslationFile, TranslationSection } from 'i18n'
import { ModalManager } from 'ui/components'
import theme from 'ui/theme'
import { FieldController } from 'ui/form'
import { ExerciseContext } from 'ui/eduTools'

// Polyfill the react-resize-detector.
window.ResizeObserver = ResizeObserver

describe('Check all exercises:', () => {
	Object.keys(exercises).forEach(exerciseId => {
		describe(exerciseId, () => {
			it('has a front-end exercise component', async () => {
				const Exercise = (await import(`ui/eduContent/${exercises[exerciseId].path.join('/')}/exercises/${getExerciseName(exerciseId)}`)).default
				expect(typeof Exercise).toBe('function')
			})

			it('renders properly', async () => {
				const shared = (await import(`step-wise/eduContent/${exercises[exerciseId].path.join('/')}/${getExerciseName(exerciseId)}`)).default
				const Exercise = (await import(`ui/eduContent/${exercises[exerciseId].path.join('/')}/exercises/${getExerciseName(exerciseId)}`)).default

				// Emulate the ExerciseContainer.
				const state = shared.generateState()
				const exerciseData = {
					exerciseId,
					state,
					history: [],
					progress: {},
					submitting: false,
					submitAction: noop, // (action) => submitAction(action, shared.processAction),
					startNewExercise: noop,
					shared: shared,
					solution: shared.getSolution && assembleSolution(shared.getSolution, state),
				}
				expect(() => render(
					<I18nProvider>
						<ThemeProvider theme={theme}>
							<FieldController>
								<ModalManager>
									<TranslationFile path={`eduContent/${exercises[exerciseId].path.join('/')}`}>
										<TranslationSection entry="practice">
											<ExerciseContext.Provider value={exerciseData}>
												<Exercise />
											</ExerciseContext.Provider>
										</TranslationSection>
									</TranslationFile>
								</ModalManager>
							</FieldController>
						</ThemeProvider>
					</I18nProvider>
				)).not.toThrow()
			})
		})
	})
})

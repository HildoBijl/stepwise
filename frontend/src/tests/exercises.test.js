import React from 'react'
import { render } from '@testing-library/react'
import ResizeObserver from 'resize-observer-polyfill'
import { ThemeProvider } from '@mui/material/styles'

import { noop } from '@step-wise/js-utils'
import { skillTree } from '@step-wise/skill-tree'
import { deserializeInputExerciseParameters, assembleSolution } from '@step-wise/input-exercises'
import { getAllExercises } from '@step-wise/exercises'

import { I18nProvider, TranslationFile, TranslationSection } from 'i18n'
import { ModalManager } from 'ui/components'
import theme from 'ui/theme'
import { FieldController } from 'ui/form'
import { ExerciseContext } from 'ui/eduTools'

const exerciseModules = import.meta.glob('/src/ui/eduContent/**/exercises/*.js')

function loadExercise(skill, exerciseId) {
	const path = `/src/ui/eduContent/${skill.groupPath.join('/')}/${skill.id}/exercises/${exerciseId}.js`
	const load = exerciseModules[path]
	if (!load)
		throw new Error(`No frontend exercise module found at "${path}".`)
	return load()
}

// Polyfill ResizeObserver for components that measure their layout.
window.ResizeObserver = ResizeObserver

describe('Check all exercises:', () => {
	Object.values(skillTree).forEach(skill => {
		describe(`Skill ${skill.id}`, () => {
			const exercises = getAllExercises(skill.id)
			if (Object.keys(exercises).length === 0) {
				it.skip('has no frontend exercises yet', () => {})
				return
			}
			Object.entries(exercises).forEach(([exerciseId, exercise]) => {
				describe(`Exercise ${exerciseId}`, () => {
					it('has a front-end exercise component', async () => {
						const Exercise = (await loadExercise(skill, exerciseId)).default
						expect(typeof Exercise).toBe('function')
					})

					it('renders properly', async () => {
						const shared = exercise
						const Exercise = (await loadExercise(skill, exerciseId)).default

						// Emulate the ExerciseContainer.
						const storedParameters = shared.generateParameters()
						const parameters = deserializeInputExerciseParameters(storedParameters)
						const initialState = shared.getInitialState(storedParameters)
						const exerciseData = {
							exerciseId,
							mode: 'solo',
							parameters,
							history: [],
							instance: { mode: 'solo', parameters: storedParameters, initialState, history: [] },
							state: initialState,
							submitting: false,
							submitAction: noop,
							startNewExercise: noop,
							shared: shared,
							solution: shared.getSolution && assembleSolution(shared.getSolution, parameters),
						}
						expect(() => render(
							<I18nProvider loadLanguageFiles={false}>
								<ThemeProvider theme={theme}>
									<FieldController>
										<ModalManager>
											<TranslationFile path={`eduContent/${skill.groupPath.join('/')}/${skill.id}`}>
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
	})
})

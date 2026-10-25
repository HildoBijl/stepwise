// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider, Translation, TranslationArea } from '@step-wise/i18n'

import { TranslationFile } from './TranslationFile'
import { TranslationSection } from './TranslationSection'

describe('transitional translation scopes', () => {
	it('maps an old translation file path to a new Catalog folder and name', async () => {
		const registerSource = vi.fn()
		render(<I18nProvider locale="en" sourceLocale="en" registerSource={registerSource}>
			<TranslationFile path="pages/home">
				<Translation id="title">Home</Translation>
			</TranslationFile>
		</I18nProvider>)

		await waitFor(() => expect(registerSource).toHaveBeenCalledWith(expect.objectContaining({
			folder: ['pages'],
			catalog: 'home',
			group: [],
			id: 'title',
		})))
	})

	it('maps nested and dotted old sections to a new Catalog group path', async () => {
		const registerSource = vi.fn()
		render(<I18nProvider locale="en" sourceLocale="en" registerSource={registerSource}>
			<TranslationFile path="eduContent/mechanics/forces">
				<TranslationSection entry="practice">
					<TranslationSection entry="step1.problem">
						<Translation id="instruction">Draw the forces.</Translation>
					</TranslationSection>
				</TranslationSection>
			</TranslationFile>
		</I18nProvider>)

		await waitFor(() => expect(registerSource).toHaveBeenCalledWith(expect.objectContaining({
			folder: ['eduContent', 'mechanics'],
			catalog: 'forces',
			group: ['practice', 'step1', 'problem'],
			id: 'instruction',
		})))
	})

	it('respects non-extending files and sections in both scope systems', async () => {
		const registerSource = vi.fn()
		render(<I18nProvider locale="en" sourceLocale="en" registerSource={registerSource}>
			<TranslationFile path="pages/home">
				<TranslationSection entry="outer">
					<TranslationFile path="navigation" extend={false}>
						<TranslationSection entry="buttons" extend={false}>
							<Translation id="menu">Menu</Translation>
						</TranslationSection>
					</TranslationFile>
				</TranslationSection>
			</TranslationFile>
		</I18nProvider>)

		await waitFor(() => expect(registerSource).toHaveBeenCalledWith(expect.objectContaining({
			folder: [],
			catalog: 'navigation',
			group: ['buttons'],
			id: 'menu',
		})))
	})

	it('lets an anonymous Translation use its area as a Catalog unit', async () => {
		const registerSource = vi.fn()
		render(<I18nProvider locale="en" sourceLocale="en" registerSource={registerSource}>
			<TranslationFile path="eduContent/demo/summation">
				<TranslationSection entry="practice.exercise">
					<TranslationArea name="solution">
						<Translation>The solution.</Translation>
					</TranslationArea>
				</TranslationSection>
			</TranslationFile>
		</I18nProvider>)

		await waitFor(() => expect(registerSource).toHaveBeenCalledWith(expect.objectContaining({
			folder: ['eduContent', 'demo'],
			catalog: 'summation',
			group: ['practice', 'exercise'],
			id: 'solution',
		})))
	})
})

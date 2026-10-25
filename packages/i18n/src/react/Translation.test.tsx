// @vitest-environment jsdom

import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getMessageContentFingerprint, getMessageStructureFingerprint } from '../message/index.ts'

import { Plural } from './authoring/Plural.tsx'
import { Select } from './authoring/Select.tsx'
import { I18nProvider } from './context/I18nProvider.tsx'
import { TranslationCatalog } from './scoping/TranslationCatalog.tsx'
import { TranslationGroup } from './scoping/TranslationGroup.tsx'
import { Translation, useTextTranslation } from './Translation.tsx'

describe('Translation', () => {
	it('reads the plural locale from the i18n context', () => {
		const source = <Plural value={0}>
			<Plural.One>Singular</Plural.One>
			<Plural.Other>Plural</Plural.Other>
		</Plural>

		render(<I18nProvider locale="fr" sourceLocale="en">
			<TranslationCatalog name="test"><Translation id="messages">{source}</Translation></TranslationCatalog>
		</I18nProvider>)
		expect(screen.getByText('Singular')).toBeTruthy()
	})

	it('renders exact and locale-specific plural branches', () => {
		const source = <Plural value={{ count: 2 }}>
			<Plural.Exact value={0}>No messages</Plural.Exact>
			<Plural.One>One message</Plural.One>
			<Plural.Other><Plural.Value /> messages</Plural.Other>
		</Plural>

		render(<I18nProvider locale="en" sourceLocale="en">
			<TranslationCatalog name="test"><Translation id="messages">{source}</Translation></TranslationCatalog>
		</I18nProvider>)
		expect(screen.getByText('2 messages')).toBeTruthy()
	})

	it('renders the matching select branch and falls back to other', () => {
		const source = <Select value={{ role: 'teacher' }}>
			<Select.Case value="student">Student</Select.Case>
			<Select.Case value="teacher">Teacher</Select.Case>
			<Select.Other>Member</Select.Other>
		</Select>

		render(<I18nProvider locale="en" sourceLocale="en">
			<TranslationCatalog name="test"><Translation id="role">{source}</Translation></TranslationCatalog>
		</I18nProvider>)
		expect(screen.getByText('Teacher')).toBeTruthy()
	})

	it('loads and renders a current translation from the scoped Catalog unit', async () => {
		const source = [{ type: 'text', value: 'Hello' }] as const
		const loadCatalog = async () => ({
			sourceLocale: 'en',
			targetLocale: 'nl',
			entries: [{
				type: 'group' as const,
				id: 'greetings',
				entries: [{
					type: 'unit' as const,
					id: 'welcome',
					source,
					target: {
						message: [{ type: 'text' as const, value: 'Hallo' }],
						reviewedSourceContentFingerprint: getMessageContentFingerprint(source),
						reviewedSourceStructureFingerprint: getMessageStructureFingerprint(source),
					},
				}],
			}],
		})

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test">
				<TranslationGroup path="greetings"><Translation id="welcome">Hello</Translation></TranslationGroup>
			</TranslationCatalog>
		</I18nProvider>)

		expect(await screen.findByText('Hallo')).toBeTruthy()
	})

	it.each([
		['missing', undefined],
		['needs-review', {
			message: [{ type: 'text' as const, value: 'Hallo' }],
			reviewedSourceContentFingerprint: getMessageContentFingerprint([{ type: 'text', value: 'Old hello' }]),
			reviewedSourceStructureFingerprint: getMessageStructureFingerprint([{ type: 'text', value: 'Hello' }]),
		}],
		['stale', {
			message: [{ type: 'text' as const, value: 'Hallo' }],
			reviewedSourceContentFingerprint: getMessageContentFingerprint([{ type: 'variable', name: 'old' }]),
			reviewedSourceStructureFingerprint: getMessageStructureFingerprint([{ type: 'variable', name: 'old' }]),
		}],
	] as const)('falls back to the authored source when a target is %s', async (_, target) => {
		const loadCatalog = async () => ({
			sourceLocale: 'en',
			targetLocale: 'nl',
			entries: [{ type: 'unit' as const, id: 'welcome', source: [{ type: 'text' as const, value: 'Hello' }], target }],
		})

		const view = render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test"><Translation id="welcome">Hello</Translation></TranslationCatalog>
		</I18nProvider>)
		await act(async () => {})

		expect(view.container.textContent).toBe('Hello')
	})

	it('falls back to the authored source when Catalog loading fails', async () => {
		const loadCatalog = async () => { throw new Error('Catalog unavailable') }
		const view = render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test"><Translation id="welcome">Hello</Translation></TranslationCatalog>
		</I18nProvider>)
		await act(async () => {})

		expect(view.container.textContent).toBe('Hello')
	})

	it('uses the authored source when the source locale is active', async () => {
		const loadCatalog = async () => ({
			sourceLocale: 'en',
			entries: [{ type: 'unit' as const, id: 'welcome', source: [{ type: 'text' as const, value: 'Stored source' }] }],
		})
		render(<I18nProvider locale="en" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test"><Translation id="welcome">Authored source</Translation></TranslationCatalog>
		</I18nProvider>)
		await act(async () => {})

		expect(screen.getByText('Authored source')).toBeTruthy()
		expect(screen.queryByText('Stored source')).toBeNull()
	})

	it('translates text while extending the contextual group', async () => {
		const source = [{ type: 'text', value: 'Description' }] as const
		const loadCatalog = async () => ({
			sourceLocale: 'en',
			targetLocale: 'nl',
			entries: [{
				type: 'group' as const,
				id: 'references',
				entries: [{
					type: 'group' as const,
					id: 'header',
					entries: [{
						type: 'unit' as const,
						id: 'description',
						source,
						target: {
							message: [{ type: 'text' as const, value: 'Omschrijving' }],
							reviewedSourceContentFingerprint: getMessageContentFingerprint(source),
							reviewedSourceStructureFingerprint: getMessageStructureFingerprint(source),
						},
					}],
				}],
			}],
		})
		function Header() {
			return <span>{useTextTranslation({ source: 'Description', group: 'header', extendGroup: true, id: 'description' })}</span>
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test">
				<TranslationGroup path="references"><Header /></TranslationGroup>
			</TranslationCatalog>
		</I18nProvider>)

		expect(await screen.findByText('Omschrijving')).toBeTruthy()
	})

	it('falls back to source text and rejects translations that do not resolve to a string', async () => {
		const source = [{ type: 'text', value: 'Description' }] as const
		const currentTarget = {
			message: [{ type: 'text' as const, value: 'Om' }, { type: 'text' as const, value: 'schrijving' }],
			reviewedSourceContentFingerprint: getMessageContentFingerprint(source),
			reviewedSourceStructureFingerprint: getMessageStructureFingerprint(source),
		}
		const loadCatalog = async () => ({
			sourceLocale: 'en',
			targetLocale: 'nl',
			entries: [
				{ type: 'unit' as const, id: 'missing', source },
				{ type: 'unit' as const, id: 'invalid', source, target: currentTarget },
			],
		})
		function Text({ id }: { id: 'missing' | 'invalid' }) {
			return <span>{useTextTranslation({ id, source: 'Description' })}</span>
		}

		const view = render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test"><Text id="missing" /></TranslationCatalog>
		</I18nProvider>)
		expect(await screen.findByText('Description')).toBeTruthy()

		expect(() => view.rerender(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog name="test"><Text id="invalid" /></TranslationCatalog>
		</I18nProvider>)).toThrow('A text translation must resolve to a string.')
	})

	it('registers its authored source under every active locale', () => {
		const registerSource = vi.fn()
		render(<I18nProvider locale="nl" sourceLocale="en" registerSource={registerSource}>
			<TranslationCatalog folder={['pages']} name="test">
				<TranslationGroup path="greetings"><Translation id="welcome">Hello</Translation></TranslationGroup>
			</TranslationCatalog>
		</I18nProvider>)

		expect(registerSource).toHaveBeenCalledWith({
			folder: ['pages'],
			catalog: 'test',
			group: ['greetings'],
			id: 'welcome',
			source: [{ type: 'text', value: 'Hello' }],
		})
	})

	it('registers changed sources but not equivalent rerenders', () => {
		const registerSource = vi.fn()
		function TestTranslation({ source }: { source: string }) {
			return <TranslationCatalog name="test"><Translation id="welcome">{source}</Translation></TranslationCatalog>
		}

		const view = render(<I18nProvider locale="nl" sourceLocale="en" registerSource={registerSource}>
			<TestTranslation source="Hello" />
		</I18nProvider>)
		expect(registerSource).toHaveBeenCalledTimes(1)

		view.rerender(<I18nProvider locale="nl" sourceLocale="en" registerSource={registerSource}>
			<TestTranslation source="Hello" />
		</I18nProvider>)
		expect(registerSource).toHaveBeenCalledTimes(1)

		view.rerender(<I18nProvider locale="nl" sourceLocale="en" registerSource={registerSource}>
			<TestTranslation source="Welcome" />
		</I18nProvider>)
		expect(registerSource).toHaveBeenCalledTimes(2)
		expect(registerSource).toHaveBeenLastCalledWith(expect.objectContaining({
			source: [{ type: 'text', value: 'Welcome' }],
		}))
	})
})

// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getMessageContentFingerprint, getMessageStructureFingerprint } from '../message/index.ts'

import { Plural } from './authoring/Plural.tsx'
import { Select } from './authoring/Select.tsx'
import { I18nProvider } from './context/I18nProvider.tsx'
import { TranslationCatalog } from './scoping/TranslationCatalog.tsx'
import { TranslationGroup } from './scoping/TranslationGroup.tsx'
import { Translation } from './Translation.tsx'

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
})

// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Plural } from './authoring/Plural.tsx'
import { Select } from './authoring/Select.tsx'
import { I18nProvider } from './context/I18nProvider.tsx'
import { Translation } from './Translation.tsx'

describe('Translation', () => {
	it('reads the plural locale from the i18n context', () => {
		const source = <Plural value={0}>
			<Plural.One>Singular</Plural.One>
			<Plural.Other>Plural</Plural.Other>
		</Plural>

		render(<I18nProvider locale="fr" sourceLocale="en"><Translation id="messages">{source}</Translation></I18nProvider>)
		expect(screen.getByText('Singular')).toBeTruthy()
	})

	it('renders exact and locale-specific plural branches', () => {
		const source = <Plural value={{ count: 2 }}>
			<Plural.Exact value={0}>No messages</Plural.Exact>
			<Plural.One>One message</Plural.One>
			<Plural.Other><Plural.Value /> messages</Plural.Other>
		</Plural>

		render(<I18nProvider locale="en" sourceLocale="en"><Translation id="messages">{source}</Translation></I18nProvider>)
		expect(screen.getByText('2 messages')).toBeTruthy()
	})

	it('renders the matching select branch and falls back to other', () => {
		const source = <Select value={{ role: 'teacher' }}>
			<Select.Case value="student">Student</Select.Case>
			<Select.Case value="teacher">Teacher</Select.Case>
			<Select.Other>Member</Select.Other>
		</Select>

		render(<I18nProvider locale="en" sourceLocale="en"><Translation id="role">{source}</Translation></I18nProvider>)
		expect(screen.getByText('Teacher')).toBeTruthy()
	})
})

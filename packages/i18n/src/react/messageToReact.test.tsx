// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { type Message } from '../message/index.ts'
import { messageToReact, Plural, Select, Translation, variable, withTranslation } from './index.ts'

function Equation({ children }: { children: ReactNode }) {
	return <span data-testid="equation">{children}</span>
}

const M = withTranslation(Equation, { tag: 'equation', translatedProps: [], canCopy: false, canDelete: false })

describe('message-to-React rendering', () => {
	it('translates variables and component slots while retaining the original elements', () => {
		const source = <>Hello {variable('name', 'Ada')}, <strong>important</strong>.</>
		const target: Message = [
			{ type: 'text', value: 'Hallo ' },
			{ type: 'variable', name: 'name' },
			{ type: 'text', value: ', ' },
			{ type: 'component', id: 'c1', component: 'strong', slots: { children: [{ type: 'text', value: 'belangrijk' }] } },
			{ type: 'text', value: '.' },
		]

		render(<>{messageToReact(target, source, 'nl')}</>)
		expect(screen.getByText('belangrijk').tagName).toBe('STRONG')
		expect(document.body.textContent).toContain('Hallo Ada, belangrijk.')
	})

	it('uses occurrence IDs when translated components are reordered', () => {
		const source = <>First <M>x</M>, then <M>y</M>.</>
		const target: Message = [
			{ type: 'text', value: 'Eerst ' },
			{ type: 'component', id: 'c2', component: 'equation', slots: {} },
			{ type: 'text', value: ', daarna ' },
			{ type: 'component', id: 'c1', component: 'equation', slots: {} },
			{ type: 'text', value: '.' },
		]

		render(<>{messageToReact(target, source, 'nl')}</>)
		expect(screen.getAllByTestId('equation').map(element => element.textContent)).toEqual(['y', 'x'])
	})

	it('enforces component copy and deletion permissions', () => {
		const source = <>Calculate <M>x</M>.</>
		const copied: Message = [
			{ type: 'component', id: 'c1', component: 'equation', slots: {} },
			{ type: 'component', id: 'copy1', copyOf: 'c1', component: 'equation', slots: {} },
		]

		expect(() => messageToReact(copied, source, 'en')).toThrow('may not be copied')
		expect(() => messageToReact([], source, 'en')).toThrow('may not be deleted')
	})
})

describe('translation constructs', () => {
	it('renders exact and locale-specific plural branches', () => {
		const source = <Plural value={variable('count', 2)}>
			<Plural.Exact value={0}>No messages</Plural.Exact>
			<Plural.One>One message</Plural.One>
			<Plural.Other>{variable('count', 2)} messages</Plural.Other>
		</Plural>

		render(<Translation id="messages" locale="en">{source}</Translation>)
		expect(screen.getByText('2 messages')).toBeTruthy()
	})

	it('renders the matching select branch and falls back to other', () => {
		const source = <Select value={variable('role', 'teacher')}>
			<Select.Case value="student">Student</Select.Case>
			<Select.Case value="teacher">Teacher</Select.Case>
			<Select.Other>Member</Select.Other>
		</Select>

		render(<Translation id="role">{source}</Translation>)
		expect(screen.getByText('Teacher')).toBeTruthy()
	})

})

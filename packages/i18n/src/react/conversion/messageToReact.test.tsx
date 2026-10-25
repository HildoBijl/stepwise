// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { type Message } from '../../message/index.ts'

import { Condition } from '../authoring/Condition.tsx'
import { variable } from '../authoring/variable.ts'
import { withTranslation } from '../authoring/withTranslation.tsx'
import { messageToReact } from './messageToReact.tsx'

function Equation({ children }: { children: ReactNode }) {
	return <span data-testid="equation">{children}</span>
}

function Options({ choices }: { choices: ReactNode[] }) {
	return <ul>{choices.map((choice, index) => <li key={index}>{choice}</li>)}</ul>
}

const M = withTranslation(Equation, { tag: 'equation', translatedProps: [], canCopy: false, canDelete: false })
const TranslatedOptions = withTranslation(Options, { tag: 'options', translatedProps: [{ name: 'choices', itemName: 'choice' }] })

describe('message-to-React rendering', () => {
	it('returns a single rendered node directly', () => {
		const message: Message = [{ type: 'text', value: 'Settings' }]

		expect(messageToReact(message, 'Settings', 'en')).toBe('Settings')
	})

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

	it('assigns stable keys to element-valued variables', () => {
		const source = <>Contact {variable('emailLink', <a href="mailto:test@example.com">test@example.com</a>)}.</>
		const target: Message = [
			{ type: 'text', value: 'Contacteer ' },
			{ type: 'variable', name: 'emailLink' },
			{ type: 'text', value: '.' },
		]

		const result = messageToReact(target, source, 'nl')
		expect(Array.isArray(result)).toBe(true)
		expect((result as ReactElement[])[1].key).toBe('$[1]')
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

	it('reconstructs translated array props from their item slots', () => {
		const source = <TranslatedOptions choices={[<>First choice</>, <>Second choice</>]} />
		const target: Message = [{
			type: 'component',
			id: 'c1',
			component: 'options',
			slots: {
				'choice-1': [{ type: 'text', value: 'Eerste keuze' }],
				'choice-2': [{ type: 'text', value: 'Tweede keuze' }],
			},
		}]

		render(<>{messageToReact(target, source, 'nl')}</>)
		expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['Eerste keuze', 'Tweede keuze'])
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

	it('renders Condition branches', () => {
		const target: Message = [{
			type: 'condition',
			variable: '$condition1',
			true: [{ type: 'text', value: 'Enabled' }],
			false: [{ type: 'text', value: 'Disabled' }],
		}]

		const { rerender } = render(<>{messageToReact(target, <Condition value={true}><Condition.True>On</Condition.True><Condition.False>Off</Condition.False></Condition>, 'en')}</>)
		expect(document.body.textContent).toContain('Enabled')

		rerender(<>{messageToReact(target, <Condition value={false}><Condition.True>On</Condition.True><Condition.False>Off</Condition.False></Condition>, 'en')}</>)
		expect(document.body.textContent).toContain('Disabled')
	})
})

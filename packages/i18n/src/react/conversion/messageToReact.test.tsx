// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { type Message } from '../../message/index.ts'

import { Condition } from '../authoring/Condition.tsx'
import { variable } from '../authoring/variable.ts'
import { withTranslation } from '../authoring/withTranslation.tsx'
import { messageToReact } from './messageToReact.tsx'

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

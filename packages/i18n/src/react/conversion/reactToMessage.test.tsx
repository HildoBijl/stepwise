import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Condition } from '../authoring/Condition.tsx'
import { Plural } from '../authoring/Plural.tsx'
import { Select } from '../authoring/Select.tsx'
import { variable } from '../authoring/variable.ts'
import { withTranslation } from '../authoring/withTranslation.tsx'
import { reactToMessage } from './reactToMessage.ts'

function Paragraph({ children }: { children: ReactNode }) {
	return <p>{children}</p>
}

function Input({ label }: { label: ReactNode }) {
	return <label>{label}</label>
}

function Container({ children, header }: { children: ReactNode, header: ReactNode }) {
	return <section><h2>{header}</h2>{children}</section>
}

function Equation({ children }: { children: ReactNode }) {
	return <span>{children}</span>
}

const TranslatedInput = withTranslation(Input, { tag: 'input-field', translatedProps: ['label'] })
const TranslatedParagraph = withTranslation(Paragraph, { tag: 'paragraph' })
const TranslatedContainer = withTranslation(Container, { tag: 'container', translatedProps: ['children', 'header'] })
const TranslatedEquation = withTranslation(Equation, { tag: 'equation', translatedProps: [], canCopy: false, canDelete: false })

describe('React message conversion', () => {
	it('converts text, variables, fragments and native elements', () => {
		const contents = ['Hello ', variable('name', 'Ada'), ', ', <strong key="strong">welcome</strong>, '!']
		expect(reactToMessage(contents)).toEqual([
			{ type: 'text', value: 'Hello ' },
			{ type: 'variable', name: 'name' },
			{ type: 'text', value: ', ' },
			{
				type: 'component',
				id: 'c1',
				component: 'strong',
				slots: { children: [{ type: 'text', value: 'welcome' }] },
			},
			{ type: 'text', value: '!' },
		])
	})

	it('supports shorthand named variables', () => {
		const name = 'Ada'
		expect(reactToMessage(['Hello ', { name }, '!'])).toEqual([
			{ type: 'text', value: 'Hello ' },
			{ type: 'variable', name: 'name' },
			{ type: 'text', value: '!' },
		])
	})

	it('assigns raw construct values internal names and resolves scoped values', () => {
		expect(reactToMessage(<>
			<Plural value={2}><Plural.Other><Plural.Value /> messages</Plural.Other></Plural>
			<Select value="teacher"><Select.Other><Select.Value /></Select.Other></Select>
		</>)).toEqual([
			{
				type: 'plural',
				variable: '$plural1',
				branches: { other: [{ type: 'variable', name: '$plural1' }, { type: 'text', value: ' messages' }] },
				form: 'cardinal',
			},
			{
				type: 'select',
				variable: '$select1',
				branches: { other: [{ type: 'variable', name: '$select1' }] },
			},
		])
	})

	it('uses shorthand construct variable names', () => {
		const count = 2
		expect(reactToMessage(
			<Plural value={{ count }}><Plural.Other><Plural.Value /> messages</Plural.Other></Plural>,
		)).toMatchObject([{ variable: 'count', branches: { other: [{ type: 'variable', name: 'count' }, { type: 'text', value: ' messages' }] } }])
	})

	it('converts boolean conditions', () => {
		expect(reactToMessage(
			<Condition value={true}>
				<Condition.True>Enabled</Condition.True>
				<Condition.False>Disabled</Condition.False>
			</Condition>,
		)).toEqual([{
			type: 'condition',
			variable: '$condition1',
			true: [{ type: 'text', value: 'Enabled' }],
			false: [{ type: 'text', value: 'Disabled' }],
		}])
	})

	it('uses an empty message when a Condition branch is omitted', () => {
		expect(reactToMessage(
			<Condition value={true}><Condition.True>Enabled</Condition.True></Condition>,
		)).toEqual([{ type: 'condition', variable: '$condition1', true: [{ type: 'text', value: 'Enabled' }], false: [] }])
	})

	it('resolves Value against the nearest matching nested construct', () => {
		expect(reactToMessage(
			<Plural value={2}><Plural.Other>
				<Plural value={3}><Plural.Other><Plural.Value /></Plural.Other></Plural>
				<Plural.Value />
			</Plural.Other></Plural>,
		)).toMatchObject([{
			variable: '$plural1',
			branches: { other: [
				{ variable: '$plural2', branches: { other: [{ type: 'variable', name: '$plural2' }] } },
				{ type: 'variable', name: '$plural1' },
			] },
		}])
	})

	it('rejects Value components outside their corresponding constructs', () => {
		expect(() => reactToMessage(<Plural.Value />)).toThrow('Plural.Value must be used inside')
		expect(() => reactToMessage(<Select.Value />)).toThrow('Select.Value must be used inside')
	})

	it('converts translated contents and attributes into named slots', () => {
		const contents = <TranslatedContainer header="Title">
			<TranslatedParagraph>Enter <TranslatedInput label="your answer" />.</TranslatedParagraph>
		</TranslatedContainer>
		expect(reactToMessage(contents)).toEqual([{
			type: 'component',
			id: 'c1',
			component: 'container',
			slots: {
				children: [{
					type: 'component',
					id: 'c2',
					component: 'paragraph',
					slots: { children: [
						{ type: 'text', value: 'Enter ' },
						{ type: 'component', id: 'c3', component: 'input-field', slots: { label: [{ type: 'text', value: 'your answer' }] } },
						{ type: 'text', value: '.' },
					] },
				}],
				header: [{ type: 'text', value: 'Title' }],
			},
		}])
	})

	it('omits preserved component contents from the message', () => {
		expect(reactToMessage(<TranslatedEquation>x^2</TranslatedEquation>)).toEqual([
			{ type: 'component', id: 'c1', component: 'equation', slots: {} },
		])
	})

	it('uses default behavior for ordinary custom components', () => {
		function Paragraph({ children }: { children: ReactNode }) { return <p>{children}</p> }
		expect(reactToMessage(<Paragraph>Text</Paragraph>)).toEqual([{
			type: 'component',
			id: 'c1',
			component: 'paragraph',
			slots: { children: [{ type: 'text', value: 'Text' }] },
		}])
	})

	it('rejects malformed variable shorthand', () => {
		expect(() => reactToMessage({ first: 'Ada', last: 'Lovelace' })).toThrow('Unsupported value')
	})
})

import { createElement, Fragment, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { getTranslationComponentDefinition, reactNodeToMessage, variable, withTranslation } from './index.ts'

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

const TranslatedParagraph = withTranslation(Paragraph, { tag: 'paragraph' })
const TranslatedInput = withTranslation(Input, { tag: 'input-field', translatedProps: ['label'] })
const TranslatedContainer = withTranslation(Container, { tag: 'container', translatedProps: ['children', 'header'] })
const TranslatedEquation = withTranslation(Equation, { tag: 'equation', translatedProps: [], canCopy: false, canDelete: false })

describe('withTranslation', () => {
	it('defines defaults and preserves configured component behavior', () => {
		expect(getTranslationComponentDefinition(TranslatedParagraph)).toEqual({
			tag: 'paragraph',
			translatedProps: ['children'],
			canCopy: true,
			canDelete: true,
		})
		expect(getTranslationComponentDefinition(TranslatedEquation)).toMatchObject({
			tag: 'equation',
			translatedProps: [],
			canCopy: false,
			canDelete: false,
		})
	})

	it('derives a kebab-case tag from the wrapped component name', () => {
		const Translated = withTranslation(Paragraph)
		function HTMLInput() { return <input /> }

		expect(getTranslationComponentDefinition(Translated)?.tag).toBe('paragraph')
		expect(getTranslationComponentDefinition(HTMLInput)?.tag).toBe('html-input')
	})
})

describe('React message conversion', () => {
	it('converts text, variables, fragments and native elements', () => {
		const contents = <Fragment>Hello {variable('name', 'Ada')}, <strong>welcome</strong>!</Fragment>
		expect(reactNodeToMessage(contents)).toEqual([
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

	it('converts translated contents and attributes into named slots', () => {
		const contents = <TranslatedContainer header="Title">
			<TranslatedParagraph>Enter <TranslatedInput label="your answer" />.</TranslatedParagraph>
		</TranslatedContainer>
		expect(reactNodeToMessage(contents)).toEqual([{
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
		expect(reactNodeToMessage(<TranslatedEquation>x^2</TranslatedEquation>)).toEqual([
			{ type: 'component', id: 'c1', component: 'equation', slots: {} },
		])
	})

	it('uses default behavior for ordinary custom components', () => {
		expect(reactNodeToMessage(<Paragraph>Text</Paragraph>)).toEqual([{
			type: 'component',
			id: 'c1',
			component: 'paragraph',
			slots: { children: [{ type: 'text', value: 'Text' }] },
		}])
	})

	it('rejects unmarked runtime values', () => {
		expect(() => reactNodeToMessage(createElement(TranslatedParagraph, null, { name: 'Ada' }))).toThrow('Wrap runtime values with variable')
	})
})

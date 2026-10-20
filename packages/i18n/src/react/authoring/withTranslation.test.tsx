import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { getTranslationComponentDefinition, withTranslation } from './withTranslation.tsx'

function Paragraph({ children }: { children: ReactNode }) {
	return <p>{children}</p>
}

function Equation({ children }: { children: ReactNode }) {
	return <span>{children}</span>
}

const TranslatedParagraph = withTranslation(Paragraph, { tag: 'paragraph' })
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

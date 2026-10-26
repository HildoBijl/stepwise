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
		expect(getTranslationComponentDefinition(TranslatedParagraph, () => { throw new Error('Explicit tags do not need a fallback.') })).toEqual({
			tag: 'paragraph',
			translatedProps: ['children'],
			canCopy: true,
			canDelete: true,
		})
		expect(getTranslationComponentDefinition(TranslatedEquation, () => { throw new Error('Explicit tags do not need a fallback.') })).toMatchObject({
			tag: 'equation',
			translatedProps: [],
			canCopy: false,
			canDelete: false,
		})
	})

	it('uses caller-provided tags for components without an explicit tag', () => {
		const Translated = withTranslation(Paragraph)

		expect(getTranslationComponentDefinition(Translated, () => 'component-1').tag).toBe('component-1')
		expect(getTranslationComponentDefinition(Paragraph, () => 'component-2').tag).toBe('component-2')
		expect(getTranslationComponentDefinition('strong', () => 'unused').tag).toBe('strong')
	})
})

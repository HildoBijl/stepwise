import { type ComponentType, type ReactNode } from 'react'

import { withTranslation } from '@step-wise/i18n'
import { HorizontalScroller } from '@step-wise/react-components'

import { type MathContentProps, MathContent } from './MathContent.tsx'

interface TranslationComponentMetadata {
	readonly tag: string
	readonly translation: false
}

type MathComponent = ComponentType<Omit<MathContentProps, 'displayMode'>> & TranslationComponentMetadata
type MathListComponent = ComponentType<{ readonly children: ReactNode }> & TranslationComponentMetadata

export const M: MathComponent = Object.assign(withTranslation(
	function InlineMath(props: Omit<MathContentProps, 'displayMode'>) { return <MathContent {...props} /> },
	{ tag: 'inline-math', translatedProps: [], canCopy: false, canDelete: false },
),
	{ tag: 'inline-math', translation: false as const },
)

export const BM: MathComponent = Object.assign(withTranslation(
	function BlockMath(props: Omit<MathContentProps, 'displayMode'>) { return <HorizontalScroller scrollbarOverlay={true} edgePadding={12}>
		<MathContent {...props} displayMode={true} />
	</HorizontalScroller> },
	{ tag: 'block-math', translatedProps: [], canCopy: false, canDelete: false },
),
	{ tag: 'block-math', translation: false as const },
)

export const BMList: MathListComponent = Object.assign(withTranslation(
	function BlockMathList({ children }: { readonly children: ReactNode }) { return <HorizontalScroller scrollbarOverlay={true} edgePadding={12}>
		{children}
	</HorizontalScroller> },
	{ tag: 'math-list', canCopy: false, canDelete: false },
),
	{ tag: 'math-list', translation: false as const },
)

export const BMPart: MathComponent = Object.assign(withTranslation(
	function BlockMathPart(props: Omit<MathContentProps, 'displayMode'>) { return <MathContent {...props} displayMode={true} /> },
	{ tag: 'math-list-part', translatedProps: [], canCopy: false, canDelete: false },
),
	{ tag: 'math-list-part', translation: false as const },
)

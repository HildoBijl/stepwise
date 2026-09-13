import { type ReactElement, type ReactNode } from 'react'

import { HorizontalScroller } from '@step-wise/react-components'

import { type MathContentProps, MathContent } from './MathContent.tsx'

interface TranslationComponentMetadata {
	readonly tag: string
	readonly translation: false
}

type MathComponent = ((props: Omit<MathContentProps, 'displayMode'>) => ReactElement) & TranslationComponentMetadata
type MathListComponent = ((props: { readonly children: ReactNode }) => ReactElement) & TranslationComponentMetadata

export const M: MathComponent = Object.assign(
	(props: Omit<MathContentProps, 'displayMode'>) => <MathContent {...props} />,
	{ tag: 'inline-math', translation: false as const },
)

export const BM: MathComponent = Object.assign(
	(props: Omit<MathContentProps, 'displayMode'>) => <HorizontalScroller scrollbarOverlay={true} edgePadding={12}>
		<MathContent {...props} displayMode={true} />
	</HorizontalScroller>,
	{ tag: 'block-math', translation: false as const },
)

export const BMList: MathListComponent = Object.assign(
	({ children }: { readonly children: ReactNode }) => <HorizontalScroller scrollbarOverlay={true} edgePadding={12}>
		{children}
	</HorizontalScroller>,
	{ tag: 'math-list', translation: false as const },
)

export const BMPart: MathComponent = Object.assign(
	(props: Omit<MathContentProps, 'displayMode'>) => <MathContent {...props} displayMode={true} />,
	{ tag: 'math-list-part', translation: false as const },
)

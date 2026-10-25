import { type ReactNode } from 'react'

import { withTranslation } from '@step-wise/i18n'
import { HorizontalScroller } from '@step-wise/react-components'

import { type MathContentProps, MathContent } from './MathContent.tsx'

// Inline maths.
function MBase(props: Omit<MathContentProps, 'displayMode'>) {
	return <MathContent {...props} />
}
export const M = withTranslation(MBase, { tag: 'inline-math', translatedProps: [], canCopy: false, canDelete: false })

// Block maths.
function BMBase(props: Omit<MathContentProps, 'displayMode'>) {
	return <HorizontalScroller scrollbarOverlay={true} edgePadding={12}>
		<MathContent {...props} displayMode={true} />
	</HorizontalScroller>
}
export const BM = withTranslation(BMBase, { tag: 'block-math', translatedProps: [], canCopy: false, canDelete: false })

// Equation lists.
function BMListBase({ children }: { readonly children: ReactNode }) {
	return <HorizontalScroller scrollbarOverlay={true} edgePadding={12}>
		{children}
	</HorizontalScroller>
}
export const BMList = withTranslation(BMListBase, { tag: 'math-list', canCopy: false, canDelete: false })

function BMPartBase(props: Omit<MathContentProps, 'displayMode'>) {
	return <MathContent {...props} displayMode={true} />
}
export const BMPart = withTranslation(BMPartBase, { tag: 'math-list-part', translatedProps: [], canCopy: false, canDelete: false })

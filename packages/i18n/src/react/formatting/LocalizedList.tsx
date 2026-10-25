import { Fragment, type ReactNode, useMemo } from 'react'

import { withTranslation } from '../authoring/withTranslation.tsx'
import { useI18n } from '../context/hooks.ts'

export type LocalizedListProps = {
	items: readonly ReactNode[]
	type?: Intl.ListFormatOptions['type']
	style?: Intl.ListFormatOptions['style']
}

// Format a list according to the active locale while retaining the original React nodes.
function LocalizedListBase({ items, type = 'conjunction', style = 'long' }: LocalizedListProps) {
	if (!Array.isArray(items)) throw new Error('Invalid LocalizedList items: expected an array.')
	const { locale } = useI18n()
	const formatter = useMemo(() => new Intl.ListFormat(locale, { type, style }), [locale, style, type])
	let itemIndex = 0
	return formatter.formatToParts(items.map((_, index) => String(index))).map((part, partIndex) => {
		if (part.type === 'literal') return part.value
		return <Fragment key={partIndex}>{items[itemIndex++]}</Fragment>
	})
}

// Lists determine their own language-specific punctuation and conjunctions and are therefore opaque to an outer Translation.
export const LocalizedList = withTranslation(LocalizedListBase, {
	tag: 'localized-list',
	translatedProps: [],
	canCopy: false,
	canDelete: false,
})

import { type ReactNode, useMemo } from 'react'

import { TranslationScopeContext } from './context.ts'
import { useTranslationScope } from './hooks.ts'
import { resolveSectionScope } from './resolution.ts'

export type TranslationSectionProps = {
	children: ReactNode
	id: string
	extend?: boolean
}

export function TranslationSection({ children, extend = true, id }: TranslationSectionProps) {
	const parent = useTranslationScope()
	const scope = useMemo(() => resolveSectionScope(parent, id, extend), [extend, id, parent])
	return <TranslationScopeContext.Provider value={scope}>{children}</TranslationScopeContext.Provider>
}

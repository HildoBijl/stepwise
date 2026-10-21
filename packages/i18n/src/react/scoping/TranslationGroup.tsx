import { type ReactNode, useMemo } from 'react'

import { TranslationScopeContext } from './context.ts'
import { useTranslationScope } from './hooks.ts'
import { resolveGroupScope } from './resolution.ts'
import { type TranslationGroupPathInput } from './types.ts'

export type TranslationGroupProps = {
	children: ReactNode
	path: TranslationGroupPathInput
	extend?: boolean
}

export function TranslationGroup({ children, path, extend = true }: TranslationGroupProps) {
	const parent = useTranslationScope()
	const scope = useMemo(() => resolveGroupScope(parent, path, extend), [extend, parent, path])
	return <TranslationScopeContext.Provider value={scope}>{children}</TranslationScopeContext.Provider>
}

import { type ReactNode, useMemo } from 'react'

import { TranslationScopeContext } from './context.ts'
import { useTranslationScope } from './hooks.ts'
import { resolveFolderScope } from './resolution.ts'
import { type TranslationFolderPath } from './types.ts'

export type TranslationFolderProps = {
	children: ReactNode
	path: TranslationFolderPath
	extend?: boolean
}

export function TranslationFolder({ children, path, extend = true }: TranslationFolderProps) {
	const parent = useTranslationScope()
	const scope = useMemo(() => resolveFolderScope(parent, path, extend), [extend, parent, path])
	return <TranslationScopeContext.Provider value={scope}>{children}</TranslationScopeContext.Provider>
}

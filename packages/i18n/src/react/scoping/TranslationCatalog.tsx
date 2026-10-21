import { type ReactNode, useMemo } from 'react'

import { TranslationScopeContext } from './context.ts'
import { useTranslationScope } from './hooks.ts'
import { resolveCatalogScope } from './resolution.ts'
import { type TranslationFolderPath } from './types.ts'

export type TranslationCatalogProps = {
	children: ReactNode
	name: string
	folder?: TranslationFolderPath
}

export function TranslationCatalog({ children, folder, name }: TranslationCatalogProps) {
	const parent = useTranslationScope()
	const scope = useMemo(() => resolveCatalogScope(parent, name, folder), [folder, name, parent])
	return <TranslationScopeContext.Provider value={scope}>{children}</TranslationScopeContext.Provider>
}

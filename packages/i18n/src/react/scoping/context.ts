import { createContext } from 'react'

import { type TranslationScope, type TranslationAreaScope } from './types.ts'

export const rootTranslationScope: TranslationScope = {
	folder: [],
	group: [],
}

export const TranslationScopeContext = createContext<TranslationScope>(rootTranslationScope)

export const TranslationAreaContext = createContext<TranslationAreaScope | undefined>(undefined)

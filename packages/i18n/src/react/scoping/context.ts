import { createContext } from 'react'

import { type TranslationScope } from './types.ts'

export const rootTranslationScope: TranslationScope = {
	folder: [],
	group: [],
}

export const TranslationScopeContext = createContext<TranslationScope>(rootTranslationScope)

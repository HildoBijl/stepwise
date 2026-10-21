import { useContext } from 'react'

import { TranslationScopeContext } from './context.ts'

export function useTranslationScope() {
	return useContext(TranslationScopeContext)
}

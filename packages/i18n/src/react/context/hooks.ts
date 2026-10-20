import { useContext } from 'react'

import { I18nContext, type I18nRuntime } from './context.ts'

export function useI18n(): I18nRuntime {
	const runtime = useContext(I18nContext)
	if (!runtime) throw new Error('useI18n must be used within an I18nProvider.')
	return runtime
}

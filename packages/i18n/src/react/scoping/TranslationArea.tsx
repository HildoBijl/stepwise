import { type ReactNode, useCallback, useMemo, useRef } from 'react'

import { TranslationAreaContext } from './context.ts'
import { useTranslationArea, useTranslationScope } from './hooks.ts'

export type TranslationAreaProps = {
	children: ReactNode
	name: string
}

// Reserve a semantic address that may be represented by one anonymous unit or a group of named units.
export function TranslationArea({ children, name }: TranslationAreaProps) {
	// Check the input.
	if (typeof name !== 'string' || name.length === 0 || name.includes('/')) throw new Error('Invalid translation area name: expected a non-empty path segment without "/".')

	// Check the surrounding contexts.
	const parent = useTranslationScope()
	if (!parent.catalog) throw new Error('A TranslationArea must be used inside a TranslationCatalog.')
	const parentArea = useTranslationArea()
	if (parentArea) throw new Error('A TranslationArea cannot be nested inside another TranslationArea.')

	// Track the registrations of Translation child components.
	const registrations = useRef(new Map<symbol, string | undefined>())
	const register = useCallback((token: symbol, id?: string) => {
		const registeredIds = [...registrations.current.values()]
		if (registeredIds.some(registeredId => (registeredId === undefined) !== (id === undefined))) throw new Error(`TranslationArea "${name}" cannot contain both an anonymous Translation and Translations with IDs.`)
		if (registeredIds.includes(id)) throw new Error(id === undefined ? `TranslationArea "${name}" cannot contain more than one anonymous Translation.` : `TranslationArea "${name}" contains multiple Translations with the ID "${id}".`)
		registrations.current.set(token, id)
		return () => { registrations.current.delete(token) }
	}, [name])

	// Provide this Translation Area context to child components.
	const area = useMemo(() => ({ group: parent.group, name, register }), [parent.group, name, register])
	return <TranslationAreaContext.Provider value={area}>{children}</TranslationAreaContext.Provider>
}

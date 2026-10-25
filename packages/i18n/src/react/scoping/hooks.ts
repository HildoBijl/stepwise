import { useContext, useEffect, useMemo, useRef } from 'react'

import { type CatalogAddress, type CatalogUnitAddress } from '../../catalog/index.ts'

import { type UseCatalogResult, useCatalog } from '../context/hooks.ts'

import { TranslationAreaContext, TranslationScopeContext } from './context.ts'
import { resolveCatalogAddress, resolveCatalogUnitAddress } from './resolution.ts'
import { type CatalogAddressInput, type CatalogUnitAddressInput } from './types.ts'

export type UseScopedCatalogResult = UseCatalogResult & {
	address: CatalogAddress
}

export function useTranslationScope() {
	return useContext(TranslationScopeContext)
}

export function useTranslationArea() {
	return useContext(TranslationAreaContext)
}

export function useCatalogAddress(input: CatalogAddressInput = {}): CatalogAddress {
	const scope = useTranslationScope()
	const { folder, catalog } = input
	return useMemo(() => resolveCatalogAddress(scope, input), [scope, folder, catalog])
}

export function useCatalogUnitAddress(input: CatalogUnitAddressInput): CatalogUnitAddress {
	const scope = useTranslationScope()
	const area = useTranslationArea()
	const { folder, catalog, group, extendGroup, id } = input
	return useMemo(() => resolveCatalogUnitAddress(scope, input, area), [scope, area, folder, catalog, group, extendGroup, id])
}

// Register translations that use a TranslationArea: they're in such an area and don't overwrite the catalog.
export function useTranslationAreaRegistration(input: CatalogUnitAddressInput): void {
	const area = useTranslationArea()
	const token = useRef(Symbol('translation-area-unit'))
	const { catalog, group, id } = input
	const usesArea = area !== undefined && catalog === undefined && group === undefined
	useEffect(() => usesArea ? area.register(token.current, id) : undefined, [area, id, usesArea])
}

export function useScopedCatalog(input: CatalogAddressInput = {}): UseScopedCatalogResult {
	const address = useCatalogAddress(input)
	const result = useCatalog(address.folder, address.catalog)
	return useMemo(() => ({ ...result, address }), [address, result])
}

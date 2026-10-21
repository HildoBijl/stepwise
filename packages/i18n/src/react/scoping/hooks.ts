import { useContext, useMemo } from 'react'

import { type CatalogAddress } from '../../catalog/index.ts'

import { type UseCatalogResult, useCatalog } from '../context/hooks.ts'

import { TranslationScopeContext } from './context.ts'
import { resolveCatalogAddress } from './resolution.ts'
import { type CatalogAddressInput } from './types.ts'

export type UseScopedCatalogResult = UseCatalogResult & {
	address: CatalogAddress
}

export function useTranslationScope() {
	return useContext(TranslationScopeContext)
}

export function useCatalogAddress(input: CatalogAddressInput = {}): CatalogAddress {
	const scope = useTranslationScope()
	const { folder, catalog } = input
	return useMemo(() => resolveCatalogAddress(scope, input), [scope, folder, catalog])
}

export function useScopedCatalog(input: CatalogAddressInput = {}): UseScopedCatalogResult {
	const address = useCatalogAddress(input)
	const result = useCatalog(address.folder, address.catalog)
	return useMemo(() => ({ ...result, address }), [address, result])
}

import { useContext, useMemo } from 'react'

import { type CatalogAddress, type CatalogUnitAddress } from '../../catalog/index.ts'

import { type UseCatalogResult, useCatalog } from '../context/hooks.ts'

import { TranslationScopeContext } from './context.ts'
import { resolveCatalogAddress, resolveCatalogUnitAddress } from './resolution.ts'
import { type CatalogAddressInput, type CatalogUnitAddressInput } from './types.ts'

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

export function useCatalogUnitAddress(input: CatalogUnitAddressInput): CatalogUnitAddress {
	const scope = useTranslationScope()
	const { folder, catalog, group, id } = input
	return useMemo(() => resolveCatalogUnitAddress(scope, input), [scope, folder, catalog, group, id])
}

export function useScopedCatalog(input: CatalogAddressInput = {}): UseScopedCatalogResult {
	const address = useCatalogAddress(input)
	const result = useCatalog(address.folder, address.catalog)
	return useMemo(() => ({ ...result, address }), [address, result])
}

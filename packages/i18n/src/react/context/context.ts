import { createContext } from 'react'

import { type Message } from '../../message/index.ts'
import { type CatalogUnitAddress } from '../../catalog/index.ts'

import { type CatalogStore } from './catalogStore.ts'

export type I18nRuntime = {
	locale: string
	sourceLocale: string
	catalogStore: CatalogStore
	getCatalog: CatalogStore['getCatalog']
	isCatalogLoaded: CatalogStore['isCatalogLoaded']
	isCatalogLoading: CatalogStore['isCatalogLoading']
	loadCatalog: CatalogStore['loadCatalog']
	registerSource?: SourceRegistrar
}

export type SourceRegistrar = (registration: SourceRegistration) => void
export type SourceRegistration = CatalogUnitAddress & {
	source: Message
}

export const I18nContext = createContext<I18nRuntime | undefined>(undefined)

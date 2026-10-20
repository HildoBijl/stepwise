import { createContext } from 'react'

import { type Catalog } from '../catalog/index.ts'
import { type Message } from '../message/index.ts'

export type I18nRuntime = {
	locale: string
	sourceLocale: string
	catalogs: ReadonlyMap<string, Catalog>
	loadingCatalogs: ReadonlySet<string>
	getCatalog: (locale: string, path: string) => Catalog | undefined
	isCatalogLoaded: (locale: string, path: string) => boolean
	isCatalogLoading: (locale: string, path: string) => boolean
	loadCatalog: (locale: string, path: string) => Promise<Catalog>
	registerSource?: SourceRegistrar
}

export type SourceRegistrar = (registration: SourceRegistration) => void

export type SourceRegistration = {
	catalogPath: string
	id: string
	source: Message
}

export const I18nContext = createContext<I18nRuntime | undefined>(undefined)

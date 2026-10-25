import { type CatalogFolderPath, type CatalogGroupPath } from '../../catalog/index.ts'

// Input for scoping components.
export type TranslationFolderPathInput = string | CatalogFolderPath
export type TranslationGroupPathInput = string | CatalogGroupPath

// Output of the scoping components: the context value.
export type TranslationScope = {
	folder: CatalogFolderPath
	catalog?: string
	group: CatalogGroupPath
}

// Output for the TranslationArea scope: the context value.
export type TranslationAreaScope = {
	group: CatalogGroupPath
	name: string
	register: (token: symbol, id?: string) => () => void
}

// Input for the resolution of a Catalog address.
export type CatalogAddressInput = {
	folder?: never
	catalog?: string
} | {
	folder: CatalogFolderPath
	catalog: string
}

// Input for the determination of a Catalog unit address.
export type CatalogUnitAddressInput = {
	folder?: never
	catalog?: never
	group?: CatalogGroupPath
	id?: string
} | {
	folder?: never
	catalog: string
	group: CatalogGroupPath
	id: string
} | {
	folder: CatalogFolderPath
	catalog: string
	group: CatalogGroupPath
	id: string
}

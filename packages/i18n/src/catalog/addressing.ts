export type CatalogFolderPath = readonly string[]
export type CatalogGroupPath = readonly string[]

export type CatalogAddress = {
	folder: CatalogFolderPath
	catalog: string
}

export type CatalogUnitAddress = CatalogAddress & {
	group: CatalogGroupPath
	id: string
}

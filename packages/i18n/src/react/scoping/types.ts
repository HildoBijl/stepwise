export type TranslationFolderPath = readonly string[]
export type TranslationSectionPath = readonly string[]

export type TranslationScope = {
	folder: TranslationFolderPath
	catalog?: string
	section: TranslationSectionPath
}

export type TranslationAddress = {
	folder: TranslationFolderPath
	catalog: string
	section: TranslationSectionPath
	id: string
}

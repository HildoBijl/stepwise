import React from 'react'

import { TranslationCatalog } from '@step-wise/i18n'
import { getModule } from '@step-wise/module-tree'

// Keep the module catalog address in one place.
export function ModuleTranslationScope({ moduleId, children }) {
	const module = getModule(moduleId)
	return <TranslationCatalog folder={['eduContent', ...module.groupPath]} name={module.id}>{children}</TranslationCatalog>
}

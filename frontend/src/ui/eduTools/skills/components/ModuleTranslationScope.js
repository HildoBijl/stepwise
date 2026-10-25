import React from 'react'

import { getModule } from '@step-wise/module-tree'

import { TranslationFile } from 'i18n'

// Keep the module catalog address in one place while the old and new translation toolboxes coexist.
export function ModuleTranslationScope({ moduleId, children }) {
	const module = getModule(moduleId)
	const path = ['eduContent', ...module.groupPath, module.id].join('/')
	return <TranslationFile path={path} extend={false}>{children}</TranslationFile>
}

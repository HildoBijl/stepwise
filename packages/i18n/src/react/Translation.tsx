import { type ReactNode, Fragment, useEffect, useMemo } from 'react'

import { findCatalogUnit, getCatalogUnitStatus } from '../catalog/index.ts'
import { compareSourceMessages, getMessageContentSignature } from '../message/index.ts'

import { type TranslatableReactNode } from './authoring/variable.ts'
import { messageToReact } from './conversion/messageToReact.tsx'
import { reactToMessage } from './conversion/reactToMessage.ts'
import { useI18n } from './context/hooks.ts'
import { type CatalogUnitAddressInput } from './scoping/types.ts'
import { useCatalogUnitAddress, useScopedCatalog } from './scoping/hooks.ts'

export type TranslationProps = CatalogUnitAddressInput & {
	children: TranslatableReactNode
}

// Load and render a translated Catalog unit, falling back to its authored source when necessary.
export function useTranslation({ children, ...addressInput }: TranslationProps): ReactNode {
	const { locale, sourceLocale, registerSource } = useI18n()

	// Load in the catalog's respective unit.
	const address = useCatalogUnitAddress(addressInput)
	const { catalog } = useScopedCatalog(address)
	const unit = catalog && findCatalogUnit(catalog, address.group, address.id)

	// Check the source and see if the translation is still valid.
	const source = useMemo(() => reactToMessage(children), [children])
	const sourceSignature = getMessageContentSignature(source)
	const targetIsCurrent = unit && getCatalogUnitStatus(unit) === 'current' && compareSourceMessages(unit.source, source) === 'current'

	// Register the authored source for potential updating.
	useEffect(() => { registerSource?.({ source, ...address }) }, [address, registerSource, sourceSignature])

	// Determine the message that should be rendered, and apply it to the contents.
	const message = locale !== sourceLocale && targetIsCurrent ? unit.target!.message : source
	return messageToReact(message, children, locale)
}

export function Translation(props: TranslationProps) {
	return <Fragment>{useTranslation(props)}</Fragment>
}

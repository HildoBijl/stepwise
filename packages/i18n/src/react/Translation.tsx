import { type ReactNode, Fragment, useEffect, useMemo } from 'react'

import { findCatalogUnit, getCatalogUnitStatus } from '../catalog/index.ts'
import { compareSourceMessages, getMessageContentSignature } from '../message/index.ts'

import { type TranslatableReactNode } from './authoring/variable.ts'
import { messageToReact } from './conversion/messageToReact.tsx'
import { reactToMessage } from './conversion/reactToMessage.ts'
import { useI18n } from './context/hooks.ts'
import { type CatalogUnitAddressInput } from './scoping/types.ts'
import { useCatalogUnitAddress, useScopedCatalog, useTranslationAreaRegistration } from './scoping/hooks.ts'

export type TranslationProps = CatalogUnitAddressInput & {
	children: TranslatableReactNode
}

export type TextTranslationInput = CatalogUnitAddressInput & {
	source: string
}

// Load and render a translated Catalog unit, falling back to its authored source when necessary.
function useTranslatedNode(sourceNode: TranslatableReactNode, addressInput: CatalogUnitAddressInput): ReactNode {
	const { locale, sourceLocale, registerSource } = useI18n()

	// Register the Translation to any potential surrounding TranslationArea.
	useTranslationAreaRegistration(addressInput)

	// Load in the catalog's respective unit.
	const address = useCatalogUnitAddress(addressInput)
	const { catalog } = useScopedCatalog(address)
	const unit = catalog && findCatalogUnit(catalog, address.group, address.id)

	// Check the source and see if the translation is still valid.
	const source = useMemo(() => reactToMessage(sourceNode), [sourceNode])
	const sourceSignature = getMessageContentSignature(source)
	const targetIsCurrent = unit && getCatalogUnitStatus(unit) === 'current' && compareSourceMessages(unit.source, source) === 'current'

	// Register the authored source for potential updating.
	useEffect(() => { registerSource?.({ source, ...address }) }, [address, registerSource, sourceSignature])

	// Determine the message that should be rendered, and apply it to the contents.
	const message = locale !== sourceLocale && targetIsCurrent ? unit.target!.message : source
	return messageToReact(message, sourceNode, locale)
}

// Translate a plain-text Catalog unit for use as a string prop or calculated value.
export function useTextTranslation({ source, ...addressInput }: TextTranslationInput): string {
	const translation = useTranslatedNode(source, addressInput)
	if (typeof translation !== 'string') throw new Error('A text translation must resolve to a string.')
	return translation
}

// Translate a React node.
export function Translation({ children, ...addressInput }: TranslationProps) {
	return <Fragment>{useTranslatedNode(children, addressInput)}</Fragment>
}

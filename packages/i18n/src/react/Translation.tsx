import { Fragment } from 'react'

import { type TranslatableReactNode } from './authoring/variable.ts'
import { messageToReact } from './conversion/messageToReact.tsx'
import { reactToMessage } from './conversion/reactToMessage.ts'
import { useI18n } from './context/hooks.ts'

export type TranslationProps = {
	children: TranslatableReactNode
	id: string
}

// Render translatable React content using its source message until catalog resolution is connected.
export function Translation({ children }: TranslationProps) {
	const { locale } = useI18n()
	return <Fragment>{messageToReact(reactToMessage(children), children, locale)}</Fragment>
}

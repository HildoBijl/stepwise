import { Fragment } from 'react'

import { messageToReact } from './messageToReact.tsx'
import { reactToMessage } from './reactToMessage.ts'
import { type TranslatableReactNode } from './variable.ts'

export type TranslationProps = {
	children: TranslatableReactNode
	id: string
	locale?: string
}

// Render translatable React content using its source message until catalog resolution is connected.
export function Translation({ children, locale = 'en' }: TranslationProps) {
	return <Fragment>{messageToReact(reactToMessage(children), children, locale)}</Fragment>
}

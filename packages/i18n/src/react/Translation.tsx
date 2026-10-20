import { Fragment, type ReactNode } from 'react'

import { messageToReact } from './messageToReact.tsx'
import { reactToMessage } from './reactToMessage.ts'

export type TranslationProps = {
	children: ReactNode | unknown
	id: string
	locale?: string
}

// Render translatable React content using its source message until catalog resolution is connected.
export function Translation({ children, locale = 'en' }: TranslationProps) {
	return <Fragment>{messageToReact(reactToMessage(children), children, locale)}</Fragment>
}

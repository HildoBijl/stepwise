import { type ReactNode, isValidElement } from 'react'
import { createPortal } from 'react-dom'

export function ensureReactElement(element: unknown, allowString = true, allowNumber = true): ReactNode {
	if (!isValidElement(element) && (!allowString || typeof element !== 'string') && (!allowNumber || typeof element !== 'number'))
		throw new Error(`Invalid React element: expected a valid React element but received something of type "${typeof element}".`)
	return element as ReactNode
}

export function Portal({ target, children }: { target: Element | DocumentFragment | null | undefined, children: ReactNode }): ReactNode {
	return target ? createPortal(children, target) : null
}

import { type ReactElement, type ReactNode, type ReactPortal, isValidElement } from 'react'
import { createPortal } from 'react-dom'

export interface EnsureReactContentOptions {
	readonly allowString?: boolean
	readonly allowNumber?: boolean
}

export function ensureReactContent(content: unknown, options: EnsureReactContentOptions = {}): ReactElement | string | number {
	const { allowString = true, allowNumber = true } = options
	if (isValidElement(content) || (allowString && typeof content === 'string') || (allowNumber && typeof content === 'number')) return content

	const expectedTypes = ['a React element']
	if (allowString) expectedTypes.push('a string')
	if (allowNumber) expectedTypes.push('a number')
	const receivedType = content === null ? 'null' : Array.isArray(content) ? 'an array' : `type "${typeof content}"`
	throw new TypeError(`Invalid React content: expected ${expectedTypes.join(' or ')} but received ${receivedType}.`)
}

export function Portal({ target, children }: { target: Element | DocumentFragment | null | undefined, children: ReactNode }): ReactPortal | null {
	return target ? createPortal(children, target) : null
}

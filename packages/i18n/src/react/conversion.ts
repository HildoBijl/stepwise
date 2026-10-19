import { type ReactElement, type ReactNode, Fragment, isValidElement } from 'react'

import { type Message, type MessageNode, normalizeMessage } from '../message/index.ts'

import { isTranslationVariable } from './variables.ts'
import { getTranslationComponentDefinition } from './componentTranslation.tsx'

type ConversionContext = {
	nextComponentId: number
}

// Convert translatable React content to its format-independent message representation.
export function reactNodeToMessage(node: ReactNode | unknown): Message {
	return normalizeMessage(convertNode(node, { nextComponentId: 1 }))
}

// Convert a React node into a Message object used for translations. How to do so depends on its type.
function convertNode(node: unknown, context: ConversionContext): MessageNode[] {
	if (node === null || node === undefined || typeof node === 'boolean') return []
	if (typeof node === 'string' || typeof node === 'number') return [{ type: 'text', value: String(node) }]
	if (isTranslationVariable(node)) return [{ type: 'variable', name: node.name }]
	if (Array.isArray(node)) return node.flatMap(child => convertNode(child, context))
	if (isIterable(node)) return [...node].flatMap(child => convertNode(child, context))
	if (!isValidElement(node)) throw new Error('Unsupported value in translatable React content. Wrap runtime values with variable(name, value).')
	if (node.type === Fragment) return convertNode((node.props as { children?: unknown }).children, context)
	return [convertElement(node, context)]
}

// Convert a React element into a Message object used for translation.
function convertElement(element: ReactElement, context: ConversionContext): MessageNode {
	const definition = getTranslationComponentDefinition(element.type)
	const id = `c${context.nextComponentId++}`

	// Set up the slots for this component.
	const slots: Record<string, Message> = {}
	const props = element.props as Record<string, unknown>
	definition.translatedProps.forEach(prop => {
		if (props[prop] !== undefined) slots[prop] = normalizeMessage(convertNode(props[prop], context))
	})

	// Set up the Message object for the component.
	return {
		type: 'component',
		id,
		component: definition.tag,
		slots,
	}
}

// Helper to determine if a value is Iterable.
function isIterable(value: unknown): value is Iterable<unknown> {
	return typeof value === 'object' && value !== null && Symbol.iterator in value
}

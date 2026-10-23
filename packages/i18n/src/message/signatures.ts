import { normalizeMessage } from './normalization.ts'
import { type Message, type MessageNode } from './types.ts'

/*
* Message signatures: a JSON string of a normalized message.
*/

type SignatureMode = 'content' | 'structure'

// Get a string describing the canonical semantic representation of the message contents. Used to detect any source change.
export function getMessageContentSignature(message: Message): string {
	return JSON.stringify(encodeMessage(normalizeMessage(message), 'content'))
}

// Get a string describing the canonical semantic representation of the message structure. Used to detect any source change.
export function getMessageStructureSignature(message: Message): string {
	return JSON.stringify(encodeMessage(normalizeMessage(message), 'structure'))
}

// Turn a message into an array, or array of arrays, whose contents uniquely define the message.
function encodeMessage(message: Message, mode: SignatureMode): unknown[] {
	return message.map(node => encodeNode(node, mode))
}

// Turn a node into an array, or array of arrays, whose contents uniquely define the node.
function encodeNode(node: MessageNode, mode: SignatureMode): unknown {
	switch (node.type) {
		case 'text': return mode === 'content' ? ['text', node.value] : ['text']
		case 'variable': return ['variable', node.name]
		case 'component': return [
			'component',
			node.component,
			Object.entries(node.slots).map(([name, message]) => [name, encodeMessage(message, mode)]),
		]
		case 'plural': return [
			'plural',
			node.variable,
			node.form,
			Object.entries(node.branches).map(([category, message]) => [category, encodeMessage(message, mode)]),
			Object.entries(node.exactBranches ?? {}).map(([value, message]) => [value, encodeMessage(message, mode)]),
		]
		case 'select': return [
			'select',
			node.variable,
			Object.entries(node.branches).map(([value, message]) => [value, encodeMessage(message, mode)]),
		]
		case 'condition': return ['condition', node.variable, encodeMessage(node.true, mode), encodeMessage(node.false, mode)]
	}
}

/*
 * Message fingerprints: a hash of the signature.
 */

// Get a hash representing the message contents.
export function getMessageContentFingerprint(message: Message): string {
	return fingerprint(getMessageContentSignature(message))
}

// Get a hash representing the message structure.
export function getMessageStructureFingerprint(message: Message): string {
	return fingerprint(getMessageStructureSignature(message))
}

// Check whether a value has the format produced by the message fingerprint functions.
export function isMessageFingerprint(value: string): boolean {
	return /^[0-9a-f]{16}$/.test(value)
}

// A deterministic, non-cryptographic fingerprint for change detection rather than security decisions.
function fingerprint(value: string): string {
	let hash = 0xcbf29ce484222325n
	for (let index = 0; index < value.length; index++) {
		hash ^= BigInt(value.charCodeAt(index))
		hash = BigInt.asUintN(64, hash * 0x100000001b3n)
	}
	return hash.toString(16).padStart(16, '0')
}

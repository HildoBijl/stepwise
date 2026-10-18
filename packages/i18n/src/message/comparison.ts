import { getMessageContentSignature, getMessageStructureSignature } from './signatures.ts'
import { type Message, type TranslationStatus } from './types.ts'

// Classify the status of a translation by comparing its source with the most recent source.
export function compareSourceMessages(previous: Message, current: Message): Extract<TranslationStatus, 'current' | 'needs-review' | 'stale'> {
	if (getMessageStructureSignature(previous) !== getMessageStructureSignature(current)) return 'stale'
	if (getMessageContentSignature(previous) !== getMessageContentSignature(current)) return 'needs-review'
	return 'current'
}

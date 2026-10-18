export { compareSourceMessages } from './comparison.ts'
export { normalizeMessage } from './normalization.ts'
export {
	getMessageContentFingerprint,
	getMessageContentSignature,
	getMessageStructureFingerprint,
	getMessageStructureSignature,
} from './signatures.ts'
export {
	InvalidMessageError,
	assertValidMessage,
	type MessageValidationIssue,
	validateMessage,
} from './validation.ts'
export {
	type ComponentNode,
	type Message,
	type MessageNode,
	type PluralBranches,
	type PluralCategory,
	type PluralNode,
	pluralCategories,
	type SelectBranches,
	type SelectNode,
	type TextNode,
	type TranslationStatus,
	type VariableNode,
} from './types.ts'

import { sliceExpressionValue } from '@step-wise/math-input-value'

import { removeCursor } from '../../../../FieldInput'

import { getFIFuncs, getFIStartCursor, getFIEndCursor } from '..'
import { mergeWithRight, splitToRight } from '../support'
import { allFunctions as expressionFunctions } from '../Expression'

import { allFunctions as defaultFunctions } from './templates/with2In0AfterVertical'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['_', '^'],
	create,
	toLatex,
	isUpFirst,
	getInitial,
	acceptsKey,
	keyPressToFI,
	cleanUp,
	canMerge,
	merge,
	canSplit,
	split,
	charPartToValuePart: part => part === 0 ? 'subscript' : 'superscript',
	valuePartToCharPart: part => part === 'subscript' ? 0 : 1,
}

function create(expressionFI, part, position, name, alias) {
	let { value } = expressionFI
	const element = value[part]
	const applySubscript = alias === '_'

	// Check if there is a SubSup right before or after the given position. If that is the case, only move the cursor. (And possibly add the right SubSup part if it is not present yet.)
	let subSupPart
	const isSubSup = element => element?.type === 'SubSup'
	if (position === 0 && isSubSup(value[part - 1]))
		subSupPart = part - 1
	else if (position === element.length - 1 && isSubSup(value[part + 1]))
		subSupPart = part + 1
	if (subSupPart) {
		const expressionWithoutAlias = {
			...removeCursor(expressionFI),
			value: value.toSpliced(part, 1, element.replace(alias, '')),
		}
		return moveCursorToSubSup(expressionWithoutAlias, subSupPart, applySubscript, subSupPart > part)
	}

	// A new SubSup needs to be created. Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const end = getFIEndCursor(expressionFI)

	// Set up the element.
	const functionElement = { type: 'SubSup' }
	const funcs = getFIFuncs(functionElement)
	Object.assign(functionElement, funcs.getInitial(alias))

	// Build the expression around it.
	const expressionBefore = sliceExpressionValue(value, start, beforeAlias)
	const expressionAfter = sliceExpressionValue(value, afterAlias, end)
	value = [
		...expressionBefore,
		functionElement,
		...expressionAfter,
	]
	return {
		...expressionFI,
		value,
		cursor: {
			part: value.indexOf(functionElement),
			cursor: funcs.getInitialCursor(functionElement),
		},
	}
}

function moveCursorToSubSup(expressionFI, part, toSubscript, atStart) {
	let { value } = expressionFI

	// First check if the respective part (subscript or superscript) still needs to be added.
	let element = value[part]
	const elementPart = toSubscript ? 'subscript' : 'superscript'
	if (element[elementPart] === undefined) {
		element = {
			...element,
			[elementPart]: toSubscript ? '' : expressionFunctions.getEmpty(),
		}
		value = value.toSpliced(part, 1, element)
	}

	// Then check the position of the cursor.
	const cursor = {
		part,
		cursor: {
			part: elementPart,
			cursor: (atStart ? getFIStartCursor : getFIEndCursor)(toSubscript ? { type: 'SubscriptText', value: element.subscript } : { type: 'Expression', value: element.superscript }),
		},
	}

	// Set up the resulting expression.
	return {
		...expressionFI,
		value,
		cursor,
	}
}

function toLatex(FI, options) {
	const sub = FI.subscript === undefined ? undefined : { type: 'SubscriptText', value: FI.subscript }
	const sup = FI.superscript === undefined ? undefined : { type: 'Expression', value: FI.superscript }
	const subLatex = sub && getFIFuncs(sub).toLatex(sub, options)
	const supLatex = sup && getFIFuncs(sup).toLatex(sup, options)
	return {
		latex: (subLatex ? `_{${subLatex.latex}}` : ``) + (supLatex ? `^{${supLatex.latex}}` : ``),
		chars: [subLatex ? subLatex.chars : [], supLatex ? supLatex.chars : []],
	}
}

function isUpFirst() {
	return false
}

function getInitial(alias) {
	return alias === '_' ? { subscript: '' } : { superscript: expressionFunctions.getEmpty() }
}

function acceptsKey(keyInfo, FI, settings) {
	const { key } = keyInfo
	const { cursor } = FI
	if ((key === '^' || key === 'Power') && cursor.part === 'subscript')
		return true
	return defaultFunctions.acceptsKey(keyInfo, FI, settings)
}

function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { cursor } = FI
	const { key } = keyInfo

	// For a power button when inside the subscript, go to the end of the superscript.
	if ((key === '^' || key === 'Power') && cursor.part === 'subscript') {
		const newFI = FI.superscript === undefined ? { ...FI, superscript: expressionFunctions.getEmpty() } : FI // If there is no superscript yet, add an empty one.
		return {
			...newFI,
			cursor: {
				part: 'superscript',
				cursor: getFIEndCursor({ type: 'Expression', value: newFI.superscript }),
			},
		}
	}

	// Process the key as usual.
	return defaultFunctions.keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)
}

function cleanUp(FI, settings) {
	// First clean up in the default way.
	FI = defaultFunctions.cleanUp(FI, settings)

	// Then remove empty parts. Keep parts that are not empty or have a cursor in them.
	const { cursor } = FI
	const result = { ...FI }
	if (result.subscript !== undefined && result.subscript === '' && cursor?.part !== 'subscript') delete result.subscript
	if (result.superscript !== undefined && expressionFunctions.isEmpty(result.superscript) && cursor?.part !== 'superscript') delete result.superscript
	return result
}

function canMerge(FI, mergeWithNext, fromOutside) {
	return FI.superscript !== undefined && mergeWithNext // Only merge the superscript with what comes after.
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	return mergeWithRight(FI, partIndex, fromOutside)
}

function canSplit(FI) {
	return FI.cursor.part === 'superscript' // In the superscript.
}

function split(FI) {
	return splitToRight(FI)
}

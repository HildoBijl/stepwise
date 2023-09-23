import { arraySplice } from 'step-wise/util'
import { support } from 'step-wise/CAS'

import { removeCursor } from '../../../../FieldInput'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isFIEmpty } from '..'
import { mergeWithRight, splitToRight } from '../support'
import { allFunctions as expressionFunctions } from '../Expression'

import { allFunctions as defaultFunctions } from './templates/with2In0AfterVertical'
import { allFunctions as subscriptTextFunctions } from './SubscriptText'

const { getSubExpression } = support

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
}

function create(expressionFI, part, position, name, alias) {
	let { value } = expressionFI
	const element = value[part]
	const applySubscript = alias === '_'

	// Check if there is a SubSup right before or after the given position. If that is the case, only move the cursor. (And possibly add the right SubSup part if it is not present yet.)
	let subSupPart
	const isSubSup = element => element && element.type === 'Function' && element.name === 'subSup'
	if (position === 0 && isSubSup(value[part - 1]))
		subSupPart = part - 1
	else if (position === element.value.length - 1 && isSubSup(value[part + 1]))
		subSupPart = part + 1
	if (subSupPart !== undefined) {
		const expressionWithoutAlias = {
			...removeCursor(expressionFI),
			value: arraySplice(value, part, 1, { ...element, value: element.value.replace(alias, '') }),
		}
		return moveCursorToSubSup(expressionWithoutAlias, subSupPart, applySubscript, subSupPart > part)
	}

	// A new SubSup needs to be created. Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const end = getFIEndCursor(expressionFI)

	// Set up the element.
	const functionElement = {
		type: 'Function',
		name: 'subSup',
	}
	const funcs = getFIFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias)

	// Build the expression around it.
	const expressionBefore = getSubExpression(value, start, beforeAlias)
	const expressionAfter = getSubExpression(value, afterAlias, end)
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
	const elementPart = toSubscript ? 0 : 1
	if (element.value[elementPart] === null) {
		element = {
			...element,
			value: toSubscript ? [getEmptySub(), element.value[1]] : [element.value[0], getEmptySup()]
		}
		value = arraySplice(value, part, 1, element)
	}

	// Then check the position of the cursor.
	const cursor = {
		part,
		cursor: {
			part: elementPart,
			cursor: (atStart ? getFIStartCursor : getFIEndCursor)(element.value[elementPart]),
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
	const { value } = FI
	const [subLatex, supLatex] = value.map(element => element && getFIFuncs(element).toLatex(element, options))
	return {
		latex: (subLatex ? `_{${subLatex.latex}}` : ``) + (supLatex ? `^{${supLatex.latex}}` : ``),
		chars: [subLatex ? subLatex.chars : [], supLatex ? supLatex.chars : []],
	}
}

function isUpFirst() {
	return false
}

function getInitial(alias) {
	if (alias === '_') {
		return [
			getEmptySub(),
			null,
		]
	} else {
		return [
			null,
			getEmptySup(),
		]
	}
}

function getEmptySub() {
	return { type: 'SubscriptText', value: subscriptTextFunctions.getEmpty() }
}

function getEmptySup() {
	return { type: 'Expression', value: expressionFunctions.getEmpty() }
}

function acceptsKey(keyInfo, FI, settings) {
	const { key } = keyInfo
	const { cursor } = FI
	if ((key === '^' || key === 'Power') && cursor.part === 0)
		return true
	return defaultFunctions.acceptsKey(keyInfo, FI, settings)
}

function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { value, cursor } = FI
	const { key } = keyInfo

	// For a power button when inside the subscript, go to the end of the superscript.
	if ((key === '^' || key === 'Power') && cursor.part === 0) {
		const newValue = value[1] ? value : [value[0], getEmptySup()] // If there is no superscript yet, add an empty one.
		return {
			...FI,
			value: newValue,
			cursor: {
				part: 1,
				cursor: getFIEndCursor(newValue[1]),
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
	const { cursor, value } = FI
	return {
		...FI,
		value: value.map((element, part) => element && (!isFIEmpty(element) || (cursor && cursor.part === part)) ? element : null),
	}
}

function canMerge(FI, mergeWithNext, fromOutside) {
	return FI.value[1] !== null && mergeWithNext // Only merge the superscript with what comes after.
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	return mergeWithRight(FI, partIndex, fromOutside)
}

function canSplit(FI) {
	return FI.cursor.part === 1 // In the superscript.
}

function split(FI) {
	return splitToRight(FI)
}

import { arraySplice } from 'step-wise/util/arrays'
import { support } from 'step-wise/CAS'

import defaultFunctions from './templates/with2In0AfterVertical'

import { removeCursor } from '../../Input'
import { getFuncs, getDataStartCursor, getDataEndCursor, isDataEmpty } from '../'
import { mergeWithRight } from '../support/merging'
import { splitToRight } from '../support/splitting'
import Expression from '../Expression'
import SubscriptText from './SubscriptText'

const { getSubExpression } = support

const fullExport = {
	...defaultFunctions,
	aliases: ['_', '^'],
	create,
	toLatex,
	isUpFirst,
	getInitial,
	acceptsKey,
	keyPressToData,
	cleanUp,
	canMerge,
	merge,
	canSplit,
	split,
}
export default fullExport

function create(expressionData, part, position, name, alias) {
	let { value } = expressionData
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
			...removeCursor(expressionData),
			value: arraySplice(value, part, 1, { ...element, value: element.value.replace(alias, '') }),
		}
		return moveCursorToSubSup(expressionWithoutAlias, subSupPart, applySubscript, subSupPart > part)
	}

	// A new SubSup needs to be created. Define cursors.
	const start = getDataStartCursor(expressionData)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const end = getDataEndCursor(expressionData)

	// Set up the element.
	const functionElement = {
		type: 'Function',
		name: 'subSup',
	}
	const funcs = getFuncs(functionElement)
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
		...expressionData,
		value,
		cursor: {
			part: value.indexOf(functionElement),
			cursor: funcs.getInitialCursor(functionElement),
		},
	}
}

function moveCursorToSubSup(expressionData, part, toSubscript, atStart) {
	let { value } = expressionData

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
			cursor: (atStart ? getDataStartCursor : getDataEndCursor)(element.value[elementPart]),
		},
	}

	// Set up the resulting expression.
	return {
		...expressionData,
		value,
		cursor,
	}
}

function toLatex(data, options) {
	const { value } = data
	const [subLatex, supLatex] = value.map(element => element && getFuncs(element).toLatex(element, options))
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
	return { type: 'SubscriptText', value: SubscriptText.getEmpty() }
}

function getEmptySup() {
	return { type: 'Expression', value: Expression.getEmpty() }
}

function acceptsKey(keyInfo, data, settings) {
	const { key } = keyInfo
	const { cursor } = data
	if ((key === '^' || key === 'Power') && cursor.part === 0)
		return true
	return defaultFunctions.acceptsKey(keyInfo, data, settings)
}

function keyPressToData(keyInfo, data, settings, charElements, topParentData, contentsElement, cursorElement) {
	const { value, cursor } = data
	const { key } = keyInfo

	// For a power button when inside the subscript, go to the end of the superscript.
	if ((key === '^' || key === 'Power') && cursor.part === 0) {
		const newValue = value[1] ? value : [value[0], getEmptySup()] // If there is no superscript yet, add an empty one.
		return {
			...data,
			value: newValue,
			cursor: {
				part: 1,
				cursor: getDataEndCursor(newValue[1]),
			},
		}
	}

	// Process the key as usual.
	return defaultFunctions.keyPressToData(keyInfo, data, settings, charElements, topParentData, contentsElement, cursorElement)
}

function cleanUp(data, settings) {
	// First clean up in the default way.
	data = defaultFunctions.cleanUp(data, settings)

	// Then remove empty parts. Keep parts that are not empty or have a cursor in them.
	const { cursor, value } = data
	return {
		...data,
		value: value.map((element, part) => element && (!isDataEmpty(element) || (cursor && cursor.part === part)) ? element : null),
	}
}

function canMerge(data, mergeWithNext, fromOutside) {
	return data.value[1] !== null && mergeWithNext // Only merge the superscript with what comes after.
}

function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	return mergeWithRight(expressionValue, partIndex, fromOutside)
}

function canSplit(data) {
	return data.cursor.part === 1 // In the superscript.
}

function split(data) {
	return splitToRight(data)
}
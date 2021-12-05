// This is the template for functions like sqrt(...) which have a parameter after their term and have no other parameters.

import { lastOf } from 'step-wise/util/arrays'
import { support } from 'step-wise/CAS'

import { getFuncs, getDataStartCursor, getDataEndCursor, isDataEmpty } from '../..'
import { mergeWithRight } from '../../support/merging'
import { splitToRight } from '../../support/splitting'

import defaultFunctions from './default'

const { getSubExpression, findEndOfTerm } = support

const allFunctions = {
	...defaultFunctions,
	create,
	getInitial,
	getInitialCursor,
	canMerge,
	merge,
	canSplit,
	split,
	removeElement,
}
export default allFunctions

function create(expressionData, part, position, name, alias) {
	let { value } = expressionData

	// Define cursors.
	const start = getDataStartCursor(expressionData)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const endOfTerm = findEndOfTerm({ ...expressionData, cursor: afterAlias }, true, false, 1, true)
	const end = getDataEndCursor(expressionData)

	// Check if we had a bracket at the end of the term.
	let endOfTermWithoutBracket = endOfTerm
	if (endOfTerm.cursor > 0 && value[endOfTerm.part].value[endOfTerm.cursor - 1] === ')')
		endOfTermWithoutBracket = { ...endOfTerm, cursor: endOfTerm.cursor - 1 }

	// Set up the new function element. 
	const parameter = {
		type: 'Expression',
		value: getSubExpression(value, afterAlias, endOfTermWithoutBracket),
	}
	const functionElement = {
		type: 'Function',
		name,
		alias,
	}
	const funcs = getFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias, parameter)

	// Build the new Expression around it.
	value = [
		...getSubExpression(value, start, beforeAlias),
		functionElement,
		...getSubExpression(value, endOfTerm, end),
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

function getInitial(alias, parameter) {
	return [parameter]
}

function getInitialCursor(element) {
	return getDataStartCursor(element)
}

function canMerge(data, mergeWithNext, fromOutside) {
	return true
}

function merge(data, partIndex, mergeWithNext, fromOutside) {
	const { value } = data
	// If we want to merge with what came before, this actually means we must remove the element.
	if (!mergeWithNext)
		return getFuncs(value[partIndex]).removeElementFromExpression(value, partIndex, !fromOutside)
	return mergeWithRight(data, partIndex, fromOutside)
}

function canSplit(data) {
	return true
}

function split(data) {
	return splitToRight(data)
}

function removeElement(data, withBackspace) {
	const { alias, value } = data
	const parameter = lastOf(value) // Use lastOf to allow inheritance for multi-parameter functions.

	// Figure out what remains of the alias and wrap it around the parameter.
	const leftInsertion = {
		type: 'ExpressionPart',
		value: withBackspace ? alias.slice(0, -1) : alias.slice(1),
	}
	const rightInsertion = {
		type: 'ExpressionPart',
		value: isDataEmpty(parameter) ? '' : ')', // When not empty, add a closing bracket.
	}
	return {
		type: 'Expression',
		value: [
			leftInsertion,
			parameter,
			rightInsertion,
		],
		cursor: {
			part: 0,
			cursor: (withBackspace ? getDataEndCursor : getDataStartCursor)(leftInsertion),
		},
	}
}
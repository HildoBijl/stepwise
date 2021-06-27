// This is the template for functions like sqrt(...) which have a parameter after their term and have no other parameters.

import { lastOf } from 'step-wise/util/arrays'

import { getFuncs, getDataStartCursor, getDataEndCursor } from '../..'
import { findEndOfTerm, getSubExpression } from '../../support/ExpressionSupport'
import { mergeWithRight } from '../../support/merging'
import { splitToRight } from '../../support/splitting'

import defaultFunctions from './root'

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
	const { value } = expressionData

	// Define cursors.
	const start = getDataStartCursor(expressionData)
	const leftSide = { part, cursor: position }
	const rightSide = { part, cursor: position + alias.length }
	const endOfTerm = findEndOfTerm({ ...expressionData, cursor: rightSide }, true, false, 1)
	const end = getDataEndCursor(expressionData)

	// Check if we had a bracket at the end of the term.
	let endOfTermWithoutBracket = endOfTerm
	if (endOfTerm.cursor > 0 && value[endOfTerm.part].value[endOfTerm.cursor - 1] === ')')
		endOfTermWithoutBracket = { ...endOfTerm, cursor: endOfTerm.cursor - 1 }

	// Set up the new function element. 
	const parameter = {
		type: 'Expression',
		value: getSubExpression(value, rightSide, endOfTermWithoutBracket),
	}
	const functionElement = {
		type: 'Function',
		name,
		alias,
	}
	const funcs = getFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias, parameter)

	// Build the new Expression around it.
	const newValue = [
		...getSubExpression(value, start, leftSide),
		functionElement,
		...getSubExpression(value, endOfTerm, end),
	]
	const newCursor = { part: part + 1, cursor: funcs.getInitialCursor(functionElement) }
	return {
		...expressionData,
		value: newValue,
		cursor: newCursor,
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

function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	// If we want to merge with what came before, this actually means we must remove the element.
	if (!mergeWithNext)
		return getFuncs(expressionValue[partIndex]).removeElementFromExpression(expressionValue, partIndex, fromOutside)
	return mergeWithRight(expressionValue, partIndex, fromOutside)
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
		value: ')',
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
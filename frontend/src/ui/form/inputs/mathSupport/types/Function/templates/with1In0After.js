// This is the template for functions like sqrt(...) which have a parameter after their term and have no other parameters.

import { lastOf } from 'step-wise/util/arrays'
import { support } from 'step-wise/CAS'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isFIEmpty } from '../..'
import { mergeWithRight, splitToRight } from '../../support'

import defaultFunctions from './default'

const { getSubExpression, findNextClosingBracket } = support

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

function create(expressionFI, part, position, name, alias) {
	let { value } = expressionFI

	// Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const endOfTerm = findNextClosingBracket(value, afterAlias)
	const end = getFIEndCursor(expressionFI)

	// Check if there is a bracket at the end of the term. If not, put everything in the function.
	let endOfTermAfterBracket = endOfTerm
	if (endOfTerm.cursor > 0 && value[endOfTerm.part].value[endOfTerm.cursor] === ')')
		endOfTermAfterBracket = { ...endOfTerm, cursor: endOfTerm.cursor + 1 }

	// Set up the new function element. 
	const parameter = {
		type: 'Expression',
		value: getSubExpression(value, afterAlias, endOfTerm),
	}
	const functionElement = {
		type: 'Function',
		name,
		alias,
	}
	const funcs = getFIFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias, parameter)

	// Build the new Expression around it.
	value = [
		...getSubExpression(value, start, beforeAlias),
		functionElement,
		...getSubExpression(value, endOfTermAfterBracket, end),
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

function getInitial(alias, parameter) {
	return [parameter]
}

function getInitialCursor(element) {
	return getFIStartCursor(element)
}

function canMerge(FI, mergeWithNext, fromOutside) {
	return true
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	const { value } = FI
	// If we want to merge with what came before, this actually means we must remove the element.
	if (!mergeWithNext)
		return getFIFuncs(value[partIndex]).removeElementFromExpression(value, partIndex, !fromOutside)
	return mergeWithRight(FI, partIndex, fromOutside)
}

function canSplit(FI) {
	return true
}

function split(FI) {
	return splitToRight(FI)
}

function removeElement(FI, withBackspace) {
	const { alias, value } = FI
	const parameter = lastOf(value) // Use lastOf to allow inheritance for multi-parameter functions.

	// Figure out what remains of the alias and wrap it around the parameter.
	const leftInsertion = {
		type: 'ExpressionPart',
		value: withBackspace ? alias.slice(0, -1) : alias.slice(1),
	}
	const rightInsertion = {
		type: 'ExpressionPart',
		value: isFIEmpty(parameter) ? '' : ')', // When not empty, add a closing bracket.
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
			cursor: (withBackspace ? getFIEndCursor : getFIStartCursor)(leftInsertion),
		},
	}
}
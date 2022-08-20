// This is the template for functions like log[10](...) which have a parameter inside their expression and not a parameter after (which is contained in an ExpressionPart of the parent Expression.)

import { getFuncs, zoomIn, isCursorAtFIStart } from '../..'
import { mergeWithLeft } from '../../support/merging'
import { splitToLeft } from '../../support/splitting'

import defaultFunctions from './default'

const allFunctions = {
	...defaultFunctions,
	countNetBrackets,
	canMerge,
	merge,
	canSplit,
	split,
}
export default allFunctions

function canMerge(FI, mergeWithNext, fromOutside) {
	return true
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	const { value } = FI

	// If we want to merge with the next, this actually means we should remove this element.
	if (mergeWithNext)
		return getFuncs(value[partIndex]).removeElementFromExpression(value, partIndex, fromOutside)
	return mergeWithLeft(FI, partIndex, fromOutside)
}

function canSplit(FI) {
	return !isCursorAtFIStart(zoomIn(FI))
}

function split(FI) {
	return splitToLeft(FI)
}

function countNetBrackets(FI) {
	return 1
}
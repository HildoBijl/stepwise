import { sortByIndices } from 'step-wise/util/arrays'

import tabData from './tabData'

export function getOrderedTabs(pages) {
	pages = Array.isArray(pages) ? pages : Object.keys(pages) // Ensure pages is an array of page indices.
	return sortByIndices(pages, pages.map(page => tabData[page].order))
}

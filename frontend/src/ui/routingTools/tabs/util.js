import { useParams } from 'react-router-dom'

import { sortBy } from 'step-wise/util'

import { tabData } from './tabData'

export function getOrderedTabs(pages) {
	pages = Array.isArray(pages) ? pages : Object.keys(pages) // Ensure pages is an array of page indices.
	return sortBy(pages, pages.map(page => tabData[page].order))
}

// useTab returns the tab ID extracted from the URL.
export function useTab() {
	const { tab } = useParams()
	return tab
}
